import { Response } from 'express'
import { ComentarioArchivoDescarga } from '../../comunicacion/services/comentario.service'

export function enviarArchivoAdjunto(
  res: Response,
  archivo: ComentarioArchivoDescarga
) {
  const dispositionName = encodeURIComponent(archivo.nombreArchivo)
  const fallbackName = archivo.nombreArchivo.replace(/"/g, "'")

  res.setHeader(
    'Content-Disposition',
    `inline; filename="${fallbackName}"; filename*=UTF-8''${dispositionName}`
  )
  res.setHeader('Content-Type', archivo.mimeType)

  if (archivo.tipo === 'path') {
    return res.sendFile(archivo.path)
  }

  return res.send(archivo.buffer)
}
