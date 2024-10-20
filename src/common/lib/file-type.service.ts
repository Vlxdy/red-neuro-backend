import { Injectable } from '@nestjs/common'
import { fromFile } from 'file-type'

@Injectable()
export class FileTypeService {
  /**
   * Devuelve la extensión y él mime type del archivo.
   * @param {String} path - Ruta del archivo.
   */
  static async fileType(path: string) {
    try {
      const result = await fromFile(path)
      return result || null
    } catch (e) {
      console.error(`Error obteniendo el tipo de archivo: ${e.message}`)
      return null
    }
  }

  /**
   * Indica si el archivo es de un tipo MIME específico.
   * @param {String} path - Ruta del archivo.
   * @param {String} mimeType - Tipo MIME como cadena de texto.
   */
  static async isFileType(path: string, mimeType: string): Promise<boolean> {
    try {
      const result = await this.fileType(path)
      return result ? mimeType === result.mime : false
    } catch (e) {
      console.error(`Error verificando el tipo de archivo: ${e.message}`)
      return false
    }
  }

  /**
   * Indica si un archivo está en un grupo de tipos MIME específicos.
   * @param {String} path - Ruta del archivo.
   * @param {Array<String>} mimeTypes - Array de tipos MIME como cadenas de texto.
   */
  static async fileInGroupType(
    path: string,
    mimeTypes: Array<string>
  ): Promise<boolean> {
    try {
      const result = await this.fileType(path)
      return result ? mimeTypes.includes(result.mime) : false
    } catch (e) {
      console.error(
        `Error verificando si el archivo está en el grupo de tipos MIME: ${e.message}`
      )
      return false
    }
  }

  /**
   * Indica si todos los archivos están en un grupo de tipos MIME específicos.
   * @param {Array<String>} paths - Rutas de los archivos.
   * @param {Array<String>} mimeTypes - Array de tipos MIME como cadenas de texto.
   */
  static async filesInGroupType(
    paths: Array<string>,
    mimeTypes: Array<string>
  ): Promise<boolean> {
    try {
      const results = await Promise.all(
        paths.map((path) => this.fileType(path))
      )
      return results.every(
        (result) => result && mimeTypes.includes(result.mime)
      )
    } catch (e) {
      console.error(
        `Error verificando los tipos MIME de los archivos: ${e.message}`
      )
      return false
    }
  }
}
