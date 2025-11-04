import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import path from 'path'
import fs from 'fs/promises'
import { EntityManager } from 'typeorm'
import { v4 as uuid } from 'uuid'
import {
  EVAL_NUTRI_STORAGE_ROOT,
  EVAL_NUTRI_TEMP_DIR,
  getEvalNutriFinalBaseDir,
  getEvalNutriMaxFiles,
  getEvalNutriMaxFileSizeBytes,
} from '../constants/evaluacion-archivos.constants'
import { ArchivoAdjunto } from '@/application/historia-clinica/entities/archivos-adjunto.entity'
import { BaseService } from '@/common/base'

export interface EvaluacionArchivoTemporal {
  path: string
  filename: string
  originalname: string
  mimetype: string
  size: number
}

@Injectable()
export class EvaluacionArchivosService extends BaseService {
  private readonly storageRoot: string
  private readonly tempDir: string
  private readonly finalBaseDir: string
  private readonly normalizedStorageRoot: string

  constructor(private readonly configService: ConfigService) {
    super()
    const storageFromConfig = this.configService.get<string>('STORAGE_NFS_PATH')
    this.storageRoot = storageFromConfig
      ? path.isAbsolute(storageFromConfig)
        ? storageFromConfig
        : path.resolve(storageFromConfig)
      : EVAL_NUTRI_STORAGE_ROOT

    this.tempDir = EVAL_NUTRI_TEMP_DIR
    this.finalBaseDir = getEvalNutriFinalBaseDir()
    this.normalizedStorageRoot = path.resolve(this.storageRoot)
  }

  async ensureTempDirectory() {
    await fs.mkdir(this.tempDir, { recursive: true })
  }

  mapUploadedFiles(files: Express.Multer.File[]): EvaluacionArchivoTemporal[] {
    const maxFiles = getEvalNutriMaxFiles()
    if (files.length > maxFiles) {
      files.forEach((file) => {
        void this.eliminarArchivoSilencioso(file.path)
      })
      throw new Error(
        `Solo se permiten ${maxFiles} archivos por solicitud. Se recibieron ${files.length}.`
      )
    }

    const maxSize = getEvalNutriMaxFileSizeBytes()
    try {
      return files.map((file) => {
        if (file.size > maxSize) {
          throw new Error(
            `El archivo "${file.originalname}" excede el tamaño máximo permitido de ${maxSize} bytes.`
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
    idEvaluacionNutricional,
    idHistoriaClinica,
    usuarioAuditoria,
    transaccion,
  }: {
    archivos: EvaluacionArchivoTemporal[]
    idEvaluacionNutricional: string
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
          idEvaluacionNutricional
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
          idEvaluacionNutricional,
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
        `Error al adjuntar archivos para la evaluación ${idEvaluacionNutricional}: ${error instanceof Error ? error.message : error}`
      )

      await Promise.all(
        archivosGuardados.map((archivo) =>
          repository
            .delete(archivo.id)
            .catch((e) =>
              this.logger.warn(
                `No se pudo revertir la creación del archivo adjunto ${archivo.id}: ${
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

  async adjuntarArchivosAntecedente({
    archivos,
    idAntecedente,
    idHistoriaClinica,
    usuarioAuditoria,
    transaccion,
  }: {
    archivos: EvaluacionArchivoTemporal[]
    idAntecedente: string
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
          'antecedentes',
          idAntecedente
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
          idAntecedente,
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
        `Error al adjuntar archivos para el antecedente ${idAntecedente}: ${
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

  async limpiarTemporales(archivos: EvaluacionArchivoTemporal[]) {
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
          `No se pudo eliminar el archivo temporal ${ruta}: ${error instanceof Error ? error.message : error}`
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
