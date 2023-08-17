import fs from 'fs'
import path from 'path'
import { cmd } from './cmd'
import packageJson from '../../../../../package.json'

export async function createLogFile(filename: string) {
  if (!process.env.LOG_PATH) {
    throw new Error('Se requiere la variable de entorno process.env.LOG_PATH')
  }
  const basePath = path.resolve(String(process.env.LOG_PATH), packageJson.name)
  const filePath = path.resolve(basePath, filename)

  // Se elimina el contenido del fichero
  if (fs.existsSync(filePath)) {
    const command = `truncate -s 0 ${filename}`
    await cmd(command, basePath).catch(() => {})
  }

  // Se crea el fichero
  else {
    const command = `touch ${filename}`
    await cmd(command, basePath).catch(() => {})
  }
}

export const readLogFile = <T>(filename: string) => {
  if (!process.env.LOG_PATH) {
    throw new Error('Se requiere la variable de entorno process.env.LOG_PATH')
  }

  const basePath = path.resolve(String(process.env.LOG_PATH), packageJson.name)
  const filePath = path.resolve(basePath, filename)
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
