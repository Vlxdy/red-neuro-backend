import { BaseService } from '@/common/base/base-service'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { AntecedenteRepository } from '../repositories/antecedentes.repository'
import {
  CerrarAntecedenteDto,
  CreateAntecedenteDto,
  UpdateAntecedenteDto,
} from '../dtos/antecedentes.dto'
import { Antecedente } from '../entities/antecedente.entity'
import {
  AntecedenteEstadoRegistro,
  AntecedenteFuenteDatos,
} from '../constants/antecedentes.constants'
import {
  AntecedenteResponse,
  ArchivoAdjuntoResponse,
} from '@/common/types/data-response.type'
import { ArchivoAdjunto } from '../entities/archivos-adjunto.entity'
import { ArchivoAdjuntoService } from './archivo-adjunto.service'
import { ArchivoRepository } from '../repositories/archivo.repository'
import { Status } from '@/common/constants'
import { Messages } from '@/common/constants/response-messages'
import { ArchivoAdjuntoDto } from '../dtos/historia-clinica.dto'

@Injectable()
export class AntecedenteService extends BaseService {
  constructor(
    private readonly antecedenteRepository: AntecedenteRepository,
    private readonly archivoAdjuntoService: ArchivoAdjuntoService,
    private readonly archivoRepository: ArchivoRepository
  ) {
    super()
  }

  async crearAntecedente({
    idHistoriaClinica,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idHistoriaClinica: string
    data: CreateAntecedenteDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }): Promise<AntecedenteResponse> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) =>
        await this.crearAntecedente({
          idHistoriaClinica,
          data,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      return await this.antecedenteRepository.runTransaction(op)
    }

    const {
      archivos,
      estadoRegistro,
      motivoActualizacion,
      idEvaluacionNutricionalOrigen,
      fuenteDatos,
      ...camposClinicos
    } = data

    const ultimaVersion = await this.antecedenteRepository.buscarUltimaVersion(
      idHistoriaClinica,
      transaccion
    )

    if (
      ultimaVersion &&
      ultimaVersion.estadoRegistro === AntecedenteEstadoRegistro.BORRADOR
    ) {
      throw new PreconditionFailedException(Messages.ANTECEDENTE_DRAFT_EXISTS)
    }

    let version = 1
    if (ultimaVersion) {
      version = (ultimaVersion.version ?? 0) + 1
      if (ultimaVersion.estadoRegistro !== AntecedenteEstadoRegistro.OBSOLETO) {
        await this.antecedenteRepository.actualizarAntecedente({
          id: ultimaVersion.id,
          data: { estadoRegistro: AntecedenteEstadoRegistro.OBSOLETO },
          usuarioAuditoria,
          transaccion,
        })
      }
    }

    const estado = estadoRegistro ?? AntecedenteEstadoRegistro.BORRADOR
    const fuente = fuenteDatos ?? AntecedenteFuenteDatos.PROFESIONAL
    const fechaCierre =
      estado === AntecedenteEstadoRegistro.COMPLETO ? new Date() : null

    const nuevoAntecedente = await this.antecedenteRepository.crearAntecedente({
      idHistoriaClinica,
      data: camposClinicos as CreateAntecedenteDto,
      usuarioAuditoria,
      transaccion,
      version,
      estadoRegistro: estado,
      motivoActualizacion,
      fuenteDatos: fuente,
      idEvaluacionNutricionalOrigen,
      fechaCierre,
    })

    if (archivos?.length) {
      for (const archivo of archivos) {
        await this.archivoAdjuntoService.crearArchivo({
          idHistoriaClinica,
          data: archivo,
          usuarioAuditoria,
          transaccion,
          idAntecedente: nuevoAntecedente.id,
        })
      }
    }

    const antecedenteCreado = await this.antecedenteRepository.buscarPorId(
      nuevoAntecedente.id,
      transaccion
    )

    if (!antecedenteCreado) {
      throw new NotFoundException(Messages.ANTECEDENTE_NOT_FOUND)
    }

    return this.formatarRespuestaAntecedente(antecedenteCreado)
  }

  async actualizarAntecedente({
    idHistoriaClinica,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idHistoriaClinica: string
    data: UpdateAntecedenteDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }): Promise<AntecedenteResponse> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) =>
        await this.actualizarAntecedente({
          idHistoriaClinica,
          data,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      return await this.antecedenteRepository.runTransaction(op)
    }

    const { archivos, estadoRegistro, ...camposClinicos } = data

    if (archivos?.length) {
      throw new BadRequestException(
        'Los archivos se deben adjuntar mediante el endpoint específico.'
      )
    }

    if (
      estadoRegistro &&
      estadoRegistro !== AntecedenteEstadoRegistro.BORRADOR
    ) {
      throw new BadRequestException(Messages.ANTECEDENTE_INVALID_STATE)
    }

    const antecedenteActual =
      await this.antecedenteRepository.buscarUltimaVersion(
        idHistoriaClinica,
        transaccion
      )

    if (!antecedenteActual) {
      throw new NotFoundException(Messages.ANTECEDENTE_NOT_FOUND)
    }

    if (
      antecedenteActual.estadoRegistro !== AntecedenteEstadoRegistro.BORRADOR
    ) {
      throw new PreconditionFailedException(Messages.ANTECEDENTE_INVALID_STATE)
    }

    await this.antecedenteRepository.actualizarAntecedente({
      id: antecedenteActual.id,
      data: camposClinicos,
      usuarioAuditoria,
      transaccion,
    })

    const antecedenteActualizado = await this.antecedenteRepository.buscarPorId(
      antecedenteActual.id,
      transaccion
    )

    if (!antecedenteActualizado) {
      throw new NotFoundException(Messages.ANTECEDENTE_NOT_FOUND)
    }

    return this.formatarRespuestaAntecedente(antecedenteActualizado)
  }

  async cerrarAntecedente({
    idHistoriaClinica,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idHistoriaClinica: string
    data: CerrarAntecedenteDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }): Promise<AntecedenteResponse> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) =>
        await this.cerrarAntecedente({
          idHistoriaClinica,
          data,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      return await this.antecedenteRepository.runTransaction(op)
    }

    const antecedenteActual =
      await this.antecedenteRepository.buscarUltimaVersion(
        idHistoriaClinica,
        transaccion
      )

    if (!antecedenteActual) {
      throw new NotFoundException(Messages.ANTECEDENTE_NOT_FOUND)
    }

    if (
      antecedenteActual.estadoRegistro === AntecedenteEstadoRegistro.OBSOLETO
    ) {
      throw new PreconditionFailedException(Messages.ANTECEDENTE_INVALID_STATE)
    }

    await this.antecedenteRepository.actualizarAntecedente({
      id: antecedenteActual.id,
      data: {
        estadoRegistro: AntecedenteEstadoRegistro.COMPLETO,
        motivoActualizacion:
          data.motivoActualizacion ??
          antecedenteActual.motivoActualizacion ??
          null,
        idEvaluacionNutricionalOrigen:
          typeof data.idEvaluacionNutricionalOrigen !== 'undefined'
            ? data.idEvaluacionNutricionalOrigen
            : (antecedenteActual.idEvaluacionNutricionalOrigen ?? null),
        fuenteDatos: data.fuenteDatos ?? antecedenteActual.fuenteDatos,
        fechaCierre: new Date(),
      },
      usuarioAuditoria,
      transaccion,
    })

    const antecedenteCerrado = await this.antecedenteRepository.buscarPorId(
      antecedenteActual.id,
      transaccion
    )

    if (!antecedenteCerrado) {
      throw new NotFoundException(Messages.ANTECEDENTE_NOT_FOUND)
    }

    return this.formatarRespuestaAntecedente(antecedenteCerrado)
  }

  async listarVersiones(
    idHistoriaClinica: string
  ): Promise<AntecedenteResponse[]> {
    const versiones =
      await this.antecedenteRepository.listarVersionesPorHistoriaClinica(
        idHistoriaClinica
      )
    return versiones.map((version) =>
      this.formatarRespuestaAntecedente(version)
    )
  }

  async obtenerVersion({
    idHistoriaClinica,
    version,
  }: {
    idHistoriaClinica: string
    version: number
  }): Promise<AntecedenteResponse> {
    const antecedente = await this.antecedenteRepository.buscarPorVersion(
      idHistoriaClinica,
      version
    )

    if (!antecedente) {
      throw new NotFoundException(Messages.ANTECEDENTE_VERSION_NOT_FOUND)
    }

    return this.formatarRespuestaAntecedente(antecedente)
  }

  async adjuntarArchivo({
    idHistoriaClinica,
    version,
    data,
    usuarioAuditoria,
  }: {
    idHistoriaClinica: string
    version: number
    data: ArchivoAdjuntoDto
    usuarioAuditoria: string
  }): Promise<ArchivoAdjuntoResponse> {
    return await this.antecedenteRepository.runTransaction(
      async (transaccion) => {
        const antecedente = await this.antecedenteRepository.buscarPorVersion(
          idHistoriaClinica,
          version,
          transaccion
        )

        if (!antecedente) {
          throw new NotFoundException(Messages.ANTECEDENTE_VERSION_NOT_FOUND)
        }

        const archivo = await this.archivoAdjuntoService.crearArchivo({
          idHistoriaClinica,
          data,
          usuarioAuditoria,
          idAntecedente: antecedente.id,
          transaccion,
        })

        return this.mapArchivoAdjunto(archivo)
      }
    )
  }

  async eliminarArchivo({
    idHistoriaClinica,
    version,
    idArchivo,
    usuarioAuditoria,
  }: {
    idHistoriaClinica: string
    version: number
    idArchivo: string
    usuarioAuditoria: string
  }): Promise<{ id: string }> {
    return await this.antecedenteRepository.runTransaction(
      async (transaccion) => {
        const antecedente = await this.antecedenteRepository.buscarPorVersion(
          idHistoriaClinica,
          version,
          transaccion
        )

        if (!antecedente) {
          throw new NotFoundException(Messages.ANTECEDENTE_VERSION_NOT_FOUND)
        }

        const archivo = antecedente.archivos?.find(
          (item) => String(item.id) === String(idArchivo)
        )

        if (!archivo) {
          throw new NotFoundException(Messages.ANTECEDENTE_ARCHIVO_NOT_FOUND)
        }

        await this.archivoRepository.actualizarArchivo({
          id: archivo.id,
          usuarioAuditoria,
          transaccion,
          data: { estado: Status.INACTIVE },
        })

        return { id: archivo.id }
      }
    )
  }

  async buscarAntecedentePorHistoriaClinica(
    idHistoriaClinica: string
  ): Promise<AntecedenteResponse | null> {
    const antecedente =
      await this.antecedenteRepository.buscarUltimaVersion(idHistoriaClinica)
    return antecedente ? this.formatarRespuestaAntecedente(antecedente) : null
  }

  formatarRespuestaAntecedente(antecedente: Antecedente): AntecedenteResponse {
    const { archivos } = antecedente

    return {
      id: antecedente.id,
      enfermedadDiagnosticada: antecedente.enfermedadDiagnosticada,
      antecedentesFamiliares: antecedente.antecedentesFamiliares,
      sigueTratamiento: antecedente.sigueTratamiento,
      tieneCirugia: antecedente.tieneCirugia,
      tieneDiarrea: antecedente.tieneDiarrea,
      tieneEstrenimiento: antecedente.tieneEstrenimiento,
      tieneNauseas: antecedente.tieneNauseas,
      tieneVomitos: antecedente.tieneVomitos,
      alergias: antecedente.alergias,
      colicos: antecedente.colicos,
      descripcionCirugia: antecedente.descripcionCirugia,
      descripcionEnfermedad: antecedente.descripcionEnfermedad,
      descripcionTratamiento: antecedente.descripcionTratamiento,
      dietasAnteriores: antecedente.dietasAnteriores,
      fechaUltimaMenstruacion: antecedente.fechaUltimaMenstruacion as string,
      frecuenciaEvacuacion: antecedente.frecuenciaEvacuacion,
      intolerancias: antecedente.intolerancias,
      menstruacionRegular: antecedente.menstruacionRegular,
      metodoAnticonceptivo: antecedente.metodoAnticonceptivo,
      tipoDeposicion: antecedente.tipoDeposicion,
      estado: antecedente.estado,
      fechaCreacion: antecedente.fechaCreacion,
      fechaModificacion: antecedente.fechaModificacion ?? null,
      fechaCierre: antecedente.fechaCierre ?? null,
      idHistoriaClinica: antecedente.idHistoriaClinica,
      estadoRegistro: antecedente.estadoRegistro,
      motivoActualizacion: antecedente.motivoActualizacion ?? null,
      version: antecedente.version,
      fuenteDatos: antecedente.fuenteDatos,
      idEvaluacionNutricionalOrigen:
        antecedente.idEvaluacionNutricionalOrigen ?? null,
      archivos:
        archivos?.map((archivo) => this.mapArchivoAdjunto(archivo)) ?? null,
    }
  }

  private mapArchivoAdjunto(archivo: ArchivoAdjunto): ArchivoAdjuntoResponse {
    return {
      id: archivo.id,
      codigo: archivo.codigo,
      contenidoBase64: archivo.contenidoBase64,
      nombreArchivo: archivo.nombreArchivo,
      tipoArchivo: archivo.tipoArchivo,
      fechaCreacion: archivo.fechaCreacion,
      idHistoriaClinica: archivo.idHistoriaClinica,
      idEvaluacionNutricional: archivo.idEvaluacionNutricional ?? null,
      metadatos: archivo.metadatos ?? null,
    }
  }
}
