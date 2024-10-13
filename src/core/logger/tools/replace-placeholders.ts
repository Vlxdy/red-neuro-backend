import { inspect } from 'util'
import { Metadata, ToStringOptions } from '../types'

/**
 * Reemplaza los marcadores de posición en una cadena de texto con los valores
 * que se encuentran en el objeto de metadatos.
 * @param cadenaTexto string
 * @param metadata Metadata
 * @param colorPrimario COLOR
 * @example
 * const cadenaTexto = 'es una cadena con {varA} y {varB}'
 * const metadata = { varA: 'demo', varB: 123 }
 * const result = `es una 'cadena' con demo y 123`
 * @returns string
 */
export const replacePlaceholders = (
  cadenaTexto: string,
  metadata: Metadata,
  opt: ToStringOptions = {}
) => {
  const color = opt.color || ''
  const keyColor = opt.keyColor || ''
  const resetColor = opt.resetColor || ''

  return cadenaTexto.replace(
    /\{(\w+)\}/g,
    (match: string, key: string): string => {
      const value =
        typeof metadata[key] === 'string'
          ? metadata[key]
          : typeof metadata[key] === 'undefined'
            ? undefined
            : inspect(metadata[key], false, null, false)
      const cValue =
        typeof value === 'undefined'
          ? ''
          : `${keyColor}${key}=${resetColor}${color}${value.replace(/\n/g, `\n${color}`)}${resetColor}`
      return key in metadata ? cValue : ''
    }
  )
}
