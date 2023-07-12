import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator'
import { ValidationMessageEnum } from './i18n/es.enum'

const comp = /(-[A-Za-z0-9]{2}){0,1}/
const ext = /([eE][-]{1}){0,1}/
const doc = /[0-9]{4,10}/

export const NRO_DOC = 'nroDocumento'

/**
 * Verífica si una cadena es un número de documento válido
 * @param value cadena a validar
 * @param param1 Objeto con propiedades de validación
 *  - complemento (true defecto)
 *  - extranjero (true por defecto)
 * @returns Si el valor dado no es una cadena, devuelve falso.
 */
export function nroDocumento(
  value?: string | null,
  {
    complemento = true,
    extranjero = true,
  }: { complemento?: boolean; extranjero?: boolean } = {}
): boolean {
  const regex = new RegExp(
    '^' +
      (extranjero ? ext.source : '') +
      doc.source +
      (complemento ? comp.source : '') +
      '$'
  )
  return value ? regex.test(value) : false
}

export function NroDocumento(
  options?: any,
  validationsOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'NRO_DOC',
      constraints: [],
      validator: {
        validate: (value): boolean => nroDocumento(value, options),
        defaultMessage: buildMessage(
          () => ValidationMessageEnum.NRO_DOC,
          validationsOptions
        ),
      },
    },
    validationsOptions
  )
}
