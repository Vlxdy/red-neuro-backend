import fs, { constants } from 'node:fs/promises'
import path from 'path'
import { cmd } from './cmd'
import packageJson from '../../../../../package.json'
import dayjs from 'dayjs'

const checkFileExists = async (filePath: string) => {
  try {
    await fs.access(filePath, constants.F_OK)
    console.log(`El archivo ${filePath} existe`)
    return true
  } catch (err) {
    console.log(`El archivo ${filePath} no existe`)
    return false
  }
}

export const createLogFile = async (filename: string) => {
  if (!process.env.LOG_PATH) {
    throw new Error('Se requiere la variable de entorno process.env.LOG_PATH')
  }
  const basePath = path.resolve(String(process.env.LOG_PATH), packageJson.name)

  if (!(await checkFileExists(basePath))) {
    return
  }

  const todosFicheros = await fs.readdir(basePath)

  for (const currentFilename of todosFicheros) {
    if (!currentFilename.includes(filename)) {
      continue
    }
    const filePath = path.resolve(basePath, currentFilename)

    // Se elimina el contenido del fichero
    if (await checkFileExists(filePath)) {
      const command = `truncate -s 0 ${currentFilename}`
      await cmd(command, basePath).catch(() => ({}))
    }
  }
}

export const readLogFile = async <T>(filename: string) => {
  if (!process.env.LOG_PATH) {
    throw new Error('Se requiere la variable de entorno process.env.LOG_PATH')
  }

  const basePath = path.resolve(String(process.env.LOG_PATH), packageJson.name)
  const items = await fs.readdir(basePath)

  const files = await Promise.all(
    items
      .filter((item) => item.startsWith(filename))
      .map(async (item) => {
        const stats = await fs.stat(path.resolve(basePath, item))
        return {
          filename: item,
          createdAt: dayjs(stats.ctime),
        }
      })
  )

  const sortedFiles = files.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
  const currentFilename = sortedFiles.pop()?.filename

  if (!currentFilename) {
    throw new Error(`No existe el fichero ${filename}`)
  }

  const filePath = path.resolve(basePath, currentFilename)
  const fileContent = (await fs.readFile(filePath)).toString()

  const rows = fileContent
    .split('\n')
    .filter((line) => line)
    .map((line) => JSON.parse(line) as T)

  return {
    getEntry: (line: number) => rows[line - 1],
    getValue: (fromLine?: number) =>
      fromLine ? rows.filter((row, index) => index + 1 >= fromLine) : rows,
  }
}
