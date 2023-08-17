import { Injectable } from '@nestjs/common'

@Injectable()
export class UtilService {
  /**
   * Devuelve una expresión SQL para validar el campo estado de un modelo
   * @param items {object} Conjunto de valores.
   * @returns {string} expresión SQL
   * @example
   * enum PersonaEstadoEnum {
   *   ACTIVO = 'ACTIVO',
   *   INACTIVO = 'INACTIVO',
   * }
   * const expression = UtilService.buildCheck(PersonaEstadoEnum)
   * // expression = "_estado IN ('ACTIVO', 'INACTIVO')"
   */
  static buildStatusCheck(items: object = {}): string {
    return UtilService.buildCheck('_estado', items)
  }

  /**
   * Devuelve una expresión SQL para validar tipos enumerados (Se utiliza con el decorador `@Check()`)
   * @param field {string} Nombre del campo de la tabla (tal y como se encuentra definido en la base de datos)
   * @param items {object} Conjunto de valores.
   * @returns {string} expresión SQL
   * @example
   * enum PersonaTipoDocumentoEnum {
   *   CI = 'CI',
   *   PASAPORTE = 'PASAPORTE',
   * }
   * const expression = UtilService.buildCheck('tipo_documento', PersonaTipoDocumentoEnum)
   * // expression = "tipo_documento IN ('CI', 'PASAPORTE')"
   * @example
   * const PersonaTipoDocumento = {
   *   CI: 'CI',
   *   PASAPORTE: 'PASAPORTE',
   * }
   * const expression = UtilService.buildCheck('tipo_documento', PersonaTipoDocumento)
   * // expression = "tipo_documento IN ('CI', 'PASAPORTE')"
   */
  static buildCheck(field: string, items: object = {}): string {
    const values = Object.keys(items).map((k) => items[k])
    if (values.length === 0) {
      throw new Error('[buildCheck] Debe especificarse al menos un item')
    }
    return `${field} IN ('${values.join(`','`)}')`
  }
}
