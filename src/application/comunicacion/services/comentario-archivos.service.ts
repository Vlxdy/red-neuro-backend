import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EntityManager } from 'typeorm'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuid } from 'uuid'
import {
  CHAT_TEMP_DIR,
  getChatFinalBaseDir,
  getChatMaxFileSizeBytes,
  getChatMaxFiles,
  getChatMaxFileSizeMb,
  CHAT_STORAGE_ROOT,
} from '../../historia-clinica/constants/comentario-archivos.constants'
import { ArchivoAdjunto } from '../../archivos-adjunto/entities/archivos-adjunto.entity'

export interface ComentarioArchivoTemporal {
  path: string
  filename: string
  originalname: string
  mimetype: string
  size: number
}

@Injectable()
export class ComentarioArchivosService {
  private readonly logger = new Logger(ComentarioArchivosService.name)
  private readonly storageRoot: string
  private readonly tempDir: string
  private readonly finalBaseDir: string
  private readonly normalizedStorageRoot: string

  constructor(private readonly configService: ConfigService) {
    const storageFromConfig = this.configService.get<string>('STORAGE_NFS_PATH')
    this.storageRoot = storageFromConfig
      ? path.isAbsolute(storageFromConfig)
        ? storageFromConfig
        : path.resolve(storageFromConfig)
      : CHAT_STORAGE_ROOT

    this.tempDir = CHAT_TEMP_DIR
    this.finalBaseDir = getChatFinalBaseDir()
    this.normalizedStorageRoot = path.resolve(this.storageRoot)
  }

  async ensureTempDirectory() {
    await fs.mkdir(this.tempDir, { recursive: true })
  }

  mapUploadedFiles(files: Express.Multer.File[]): ComentarioArchivoTemporal[] {
    const maxFiles = getChatMaxFiles()
    if (files.length > maxFiles) {
      files.forEach((file) => {
        void this.eliminarArchivoSilencioso(file.path)
      })
      throw new Error(
        `Solo se permiten ${maxFiles} archivos por mensaje. Se recibieron ${files.length}.`
      )
    }

    const maxSize = getChatMaxFileSizeBytes()
    try {
      return files.map((file) => {
        if (file.size > maxSize) {
          throw new Error(
            `El archivo "${file.originalname}" excede el tamaño máximo permitido de ${getChatMaxFileSizeMb()} MB.`
          )
        }

        return {
          path: file.path,
          filename: file.filename ?? `${uuid()}`,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        }
      })
    } catch (error) {
      files.forEach((file) => {
        void this.eliminarArchivoSilencioso(file.path)
      })
      throw error
    }
  }

  async adjuntarArchivos({
    archivos,
    idComentario,
    idHistoriaClinica,
    usuarioAuditoria,
    transaccion,
  }: {
    archivos: ComentarioArchivoTemporal[]
    idComentario: string
    idHistoriaClinica: string
    usuarioAuditoria: string
    transaccion: EntityManager
  }): Promise<ArchivoAdjunto[]> {
    if (!archivos.length) {
      return []
    }

    const repository = transaccion.getRepository(ArchivoAdjunto)
    const archivosGuardados: ArchivoAdjunto[] = []
    const archivosMovidos: string[] = []

    try {
      for (const archivo of archivos) {
        const finalDir = path.join(
          this.finalBaseDir,
          idHistoriaClinica,
          'comentarios',
          idComentario
        )
        await fs.mkdir(finalDir, { recursive: true })

        const finalFilename = archivo.filename || `${uuid()}`
        const finalPath = path.join(finalDir, finalFilename)

        await fs.rename(archivo.path, finalPath)
        archivosMovidos.push(finalPath)

        const relativePath = path
          .relative(this.storageRoot, finalPath)
          .split(path.sep)
          .join('/')

        const decodedName = Buffer.from(
          archivo.originalname,
          'latin1'
        ).toString('utf8')

        const entidad = repository.create({
          idHistoriaClinica,
          idComentario,
          nombreArchivo: decodedName,
          tipoArchivo: archivo.mimetype,
          codigo: finalFilename,
          contenidoBase64: null,
          usuarioCreacion: usuarioAuditoria,
          metadatos: {
            ruta: relativePath,
            tamanoBytes: archivo.size,
            tipoMime: archivo.mimetype,
            nombreOriginal: archivo.originalname,
          },
        })

        const guardado = await repository.save(entidad)
        archivosGuardados.push(guardado)
      }

      return archivosGuardados
    } catch (error) {
      this.logger.error(
        `Error al adjuntar archivos para el comentario ${idComentario}: ${
          error instanceof Error ? error.message : error
        }`
      )

      await Promise.all(
        archivosGuardados.map((archivoGuardado) =>
          repository
            .delete(archivoGuardado.id)
            .catch((e) =>
              this.logger.warn(
                `No se pudo revertir la creación del archivo adjunto ${archivoGuardado.id}: ${
                  e instanceof Error ? e.message : e
                }`
              )
            )
        )
      )

      await Promise.all(
        archivosMovidos.map((ruta) => this.eliminarArchivoSilencioso(ruta))
      )

      throw error
    } finally {
      await Promise.all(
        archivos.map((archivo) => this.eliminarArchivoSilencioso(archivo.path))
      )
    }
  }

  async limpiarTemporales(archivos: ComentarioArchivoTemporal[]) {
    await Promise.all(
      archivos.map((archivo) => this.eliminarArchivoSilencioso(archivo.path))
    )
  }

  async obtenerRutaFinal(archivo: ArchivoAdjunto): Promise<string | null> {
    const rutaRelativa = archivo.metadatos?.ruta
    if (!rutaRelativa) {
      return null
    }

    let rutaAbsoluta: string
    try {
      rutaAbsoluta = this.resolverRutaRelativa(rutaRelativa)
    } catch (error) {
      this.logger.warn(
        `Ruta inválida para el archivo adjunto ${archivo.id}: ${
          error instanceof Error ? error.message : error
        }`
      )
      return null
    }

    try {
      await fs.access(rutaAbsoluta)
      return rutaAbsoluta
    } catch {
      this.logger.warn(
        `No se encontró el archivo físico para el adjunto ${archivo.id} en ${rutaAbsoluta}`
      )
      return null
    }
  }

  private async eliminarArchivoSilencioso(ruta: string) {
    try {
      await fs.unlink(ruta)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(
          `No se pudo eliminar el archivo temporal ${ruta}: ${
            error instanceof Error ? error.message : error
          }`
        )
      }
    }
  }

  private resolverRutaRelativa(rutaRelativa: string): string {
    const segmentos = rutaRelativa
      .replace(/\\/g, '/')
      .split('/')
      .filter((segmento) => segmento && segmento !== '.')
    const rutaResuelta = path.resolve(this.normalizedStorageRoot, ...segmentos)

    if (!rutaResuelta.startsWith(this.normalizedStorageRoot)) {
      throw new Error(
        `La ruta calculada sale del directorio permitido (${this.normalizedStorageRoot})`
      )
    }

    return rutaResuelta
  }
}
