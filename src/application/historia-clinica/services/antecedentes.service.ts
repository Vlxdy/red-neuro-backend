import { BaseService } from '@/common/base/base-service'
import {
  BadRequestException,
  ForbiddenException,
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
import { ArchivoRepository } from '../repositories/archivo.repository'
import { Status } from '@/common/constants'
import { Messages } from '@/common/constants/response-messages'
import { HistoriaClinicaRepository } from '../repositories/historia-clinica.repository'
import {
  EvaluacionArchivosService,
  EvaluacionArchivoTemporal,
} from './evaluacion-archivos.service'
import { ArchivoDescargable } from '../types/archivo-descargable.type'
import { RolEnum } from '@/core/authorization/rol.enum'

@Injectable()
export class AntecedenteService extends BaseService {
  constructor(
    private readonly antecedenteRepository: AntecedenteRepository,
    private readonly archivoRepository: ArchivoRepository,
    private readonly historiaClinicaRepository: HistoriaClinicaRepository,
    private readonly evaluacionArchivosService: EvaluacionArchivosService
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
      estadoRegistro,
      motivoActualizacion,
      idEvaluacionNutricionalOrigen,
      fuenteDatos,
      ...camposClinicos
    } = data

    const historiaClinica = await this.historiaClinicaRepository.buscarPorId(
      idHistoriaClinica,
      transaccion
    )

    if (!historiaClinica) {
      throw new NotFoundException(Messages.HISTORIA_CLINICA_NOT_FOUND)
    }

    const camposSanitizados = this.aplicarReglasGenero(
      camposClinicos,
      this.esGeneroFemenino(
        historiaClinica.paciente?.usuario?.persona?.genero ?? undefined
      )
    )

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
      data: camposSanitizados as CreateAntecedenteDto,
      usuarioAuditoria,
      transaccion,
      version,
      estadoRegistro: estado,
      motivoActualizacion,
      fuenteDatos: fuente,
      idEvaluacionNutricionalOrigen,
      fechaCierre,
    })

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

    const { estadoRegistro, ...camposClinicos } = data

    const historiaClinica = await this.historiaClinicaRepository.buscarPorId(
      idHistoriaClinica,
      transaccion
    )

    if (!historiaClinica) {
      throw new NotFoundException(Messages.HISTORIA_CLINICA_NOT_FOUND)
    }

    const camposSanitizados = this.aplicarReglasGenero(
      camposClinicos,
      this.esGeneroFemenino(
        historiaClinica.paciente?.usuario?.persona?.genero ?? undefined
      )
    )

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
      data: camposSanitizados,
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

  async adjuntarArchivos({
    idHistoriaClinica,
    version,
    archivos,
    usuarioAuditoria,
  }: {
    idHistoriaClinica: string
    version: number
    archivos: EvaluacionArchivoTemporal[]
    usuarioAuditoria: string
  }): Promise<ArchivoAdjuntoResponse[]> {
    if (!archivos.length) {
      return []
    }

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

        const adjuntos =
          await this.evaluacionArchivosService.adjuntarArchivosAntecedente({
            archivos,
            idAntecedente: antecedente.id,
            idHistoriaClinica,
            usuarioAuditoria,
            transaccion,
          })

        return adjuntos.map((archivo) => this.mapArchivoAdjunto(archivo))
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

  async obtenerArchivoDescargable({
    idHistoriaClinica,
    version,
    idArchivo,
    solicitante,
  }: {
    idHistoriaClinica: string
    version: number
    idArchivo: string
    solicitante: PassportUser
  }): Promise<ArchivoDescargable> {
    const antecedente = await this.antecedenteRepository.buscarPorVersion(
      idHistoriaClinica,
      version
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

    const roles = new Set(
      (solicitante.roles ?? []).map((rol) => rol.toUpperCase())
    )

    const esAdmin = roles.has(RolEnum.ADMINISTRADOR)
    const esNutricionista = roles.has(RolEnum.NUTRICIONISTA)
    const esPacientePropietario =
      roles.has(RolEnum.PACIENTE) &&
      solicitante.idUsuarioRol &&
      antecedente.historiaClinica?.idPaciente === solicitante.idUsuarioRol

    if (!(esAdmin || esNutricionista || esPacientePropietario)) {
      throw new ForbiddenException(
        'No tiene permisos para acceder a este archivo adjunto'
      )
    }

    const rutaFinal =
      await this.evaluacionArchivosService.obtenerRutaFinal(archivo)

    const mimeType = archivo.tipoArchivo ?? 'application/octet-stream'
    const nombreArchivo = archivo.nombreArchivo

    if (rutaFinal) {
      return {
        tipo: 'path',
        path: rutaFinal,
        nombreArchivo,
        mimeType,
      }
    }

    if (archivo.contenidoBase64) {
      return {
        tipo: 'buffer',
        buffer: Buffer.from(archivo.contenidoBase64, 'base64'),
        nombreArchivo,
        mimeType,
      }
    }

    throw new NotFoundException(
      'El archivo adjunto no tiene contenido disponible para descargar'
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

  private aplicarReglasGenero<T extends Partial<CreateAntecedenteDto>>(
    data: T,
    esPacienteFemenino: boolean
  ): T {
    if (esPacienteFemenino) {
      return data
    }

    return {
      ...data,
      fechaUltimaMenstruacion: null,
      menstruacionRegular: null,
      metodoAnticonceptivo: null,
      colicos: null,
    } as T
  }

  private esGeneroFemenino(genero?: string | null): boolean {
    if (!genero) {
      return false
    }

    return genero.trim().toLowerCase().startsWith('f')
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
      idAntecedente: archivo.idAntecedente ?? null,
      metadatos: archivo.metadatos ?? null,
    }
  }
}
