import fs from 'fs'
import path from 'path'
import { cmd } from './cmd'
import packageJson from '../../../../../package.json'
import dayjs from 'dayjs'

export async function createLogFile(filename: string) {
  if (!process.env.LOG_PATH) {
    throw new Error('Se requiere la variable de entorno process.env.LOG_PATH')
  }
  const basePath = path.resolve(String(process.env.LOG_PATH), packageJson.name)
  if (!fs.existsSync(basePath)) {
    return
  }
  const todosFicheros = fs.readdirSync(basePath)

  for (const currentFilename of todosFicheros) {
    if (!currentFilename.includes(filename)) {
      continue
    }
    const filePath = path.resolve(basePath, currentFilename)

    // Se elimina el contenido del fichero
    if (fs.existsSync(filePath)) {
      const command = `truncate -s 0 ${currentFilename}`
      await cmd(command, basePath).catch(() => ({}))
    }
  }
}

export const readLogFile = <T>(filename: string) => {
  if (!process.env.LOG_PATH) {
    throw new Error('Se requiere la variable de entorno process.env.LOG_PATH')
  }

  const basePath = path.resolve(String(process.env.LOG_PATH), packageJson.name)
  const currentFilename = fs
    .readdirSync(basePath)
    .filter((item) => {
      return item.startsWith(filename)
    })
    .map((item) => {
      return {
        filename: item,
        createdAt: dayjs(fs.statSync(path.resolve(basePath, item)).ctime),
      }
    })
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
    .pop()?.filename
  if (!currentFilename) {
    throw new Error(`No existe el fichero ${filename}`)
  }

  const filePath = path.resolve(basePath, currentFilename)
  const fileContent = fs.readFileSync(filePath).toString()

  const rows = fileContent
    .split('\n')
    .filter((line) => line)
    .map((line) => JSON.parse(line) as T)

  return {
    getEntry: (line: number) => {
      // process.stdout.write(`\n[readLogFile] ${filename} line: ${line}\n`)
      return rows[line - 1]
    },
    getValue: (fromLine?: number) => {
      if (fromLine) {
        return rows.filter((row, index) => index + 1 >= fromLine)
      }
      return rows
    },
  }
}
