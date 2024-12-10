import path from 'path'
import fs from 'node:fs/promises'
import { Injectable } from '@nestjs/common'

@Injectable()
export class FileService {
  /**
   * Indica si es un archivo.
   * @param {String} filePath - Ruta del archivo.
   * @return {Promise<boolean>}
   */
  static isFile = async (filePath: string): Promise<boolean> => {
    try {
      const stats = await fs.stat(filePath)
      return stats.isFile()
    } catch (e) {
      return false
    }
  }

  /**
   * Indica si es un directorio.
   * @param {String} filePath - Ruta del directorio.
   * @return {Promise<boolean>}
   */
  static isDirectory = async (filePath: string): Promise<boolean> => {
    try {
      const stats = await fs.stat(filePath)
      return stats.isDirectory()
    } catch (e) {
      return false
    }
  }

  /**
   * Devuelve el contenido de un archivo de texto.
   * @param {String} filePath - Ruta del archivo.
   * @param encoding
   * @return {String} contenido del archivo.
   */
  static readFile = (
    filePath: string,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<string> => {
    return fs.readFile(filePath, encoding)
  }

  /**
   * Crea un archivo.
   * @param {String} filePath - Ruta del archivo.
   * @param {String} content  - Contenido del archivo.
   */
  static writeFile = async (
    filePath: string,
    content: string | Buffer
  ): Promise<void> => {
    await fs.mkdir(path.dirname(filePath))
    await fs.writeFile(filePath, content)
  }

  /**
   * Elimina un archivo.
   * @param {String} filePath - Ruta del archivo.
   */
  static removeFile = async (filePath: string) => {
    if (await FileService.isFile(filePath)) {
      await fs.unlink(filePath)
    }
  }

  /**
   * Devuelve una lista de archivos dentro de un directorio.
   * @param {String} dirPath - Ruta del directorio.
   */
  static readdir = (dirPath: string): Promise<string[]> => {
    return fs.readdir(dirPath)
  }

  /**
   * Crea un directorio de manera recursiva
   * @param {String} dirPath - Ruta del directorio.
   */
  static createDir = async (dirPath: string) => {
    await fs.mkdir(dirPath, { recursive: true })
  }

  /**
   * Devuelve metadatos del archivo o directorio
   * @param {String} filePath - Ruta del archivo o directorio.
   */
  static stat = async (filePath: string) => {
    return await fs.stat(filePath)
  }

  /**
   * Copia archivos
   * @param {String} source Ruta del archivo origen
   * @param {String} target Ruta del archivo destino
   */
  static copyFile(source: string, target: string) {
    return fs.copyFile(source, target)
  }

  /**
   * Crea un directorio asyncrona
   * @param {String} dirPath - Ruta del directorio.
   */
  static createDirAsync = async (dirPath: string) => {
    await fs.mkdir(dirPath, { recursive: true })
  }

  static copyFileAsync = async (origen: string, destino: string) => {
    await fs.copyFile(origen, destino)
  }
}
