import { BaseService } from '@/common/base'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common'
import dayjs from 'dayjs'
import { Cron } from '@nestjs/schedule'
import {
  ActualizarCitaDto,
  ActualizarEstadoCitaDto,
  CancelarCitaDto,
  CitaResponseDto,
  CrearCitaDto,
  FiltrosCitaDto,
  FiltrosCitaPaginadoDto,
  FiltrosHistorialCitaPaginadoDto,
  HistorialCitaResponseDto,
  ReprogramarCitaDto,
} from '../dto/cita.dto'

import { CitasMedicasRepository } from '../repository/citas-medicas.repository'
import { formatearCita, formatearCitas } from '../utils/formatear-citas'
import { formatearHistorialCitas } from '../utils/formatear-historial'
import { EntityManager } from 'typeorm'
import { Cita } from '../entities/cita.entity'
import { CitasEstado, TipoCita } from '../constants'

@Injectable()
export class CitasMedicasService extends BaseService {
  constructor(
    @Inject(CitasMedicasRepository)
    private readonly citasRepository: CitasMedicasRepository
  ) {
    super()
  }

  private obtenerDuracionConsultaMinutos(): number {
    const duracion = Number(process.env.CITA_CONSULTA_DURACION_MINUTOS)
    if (Number.isFinite(duracion) && duracion > 0) {
      return duracion
    }
    return 15
  }

  private calcularFechaFin(fechaInicio: Date, duracionMinutos: number): Date {
    return dayjs(fechaInicio).add(duracionMinutos, 'minute').toDate()
  }

  private async resolverDuracionEstudio(
    idEstudio: string,
    idEspecialidad: string,
    transaccion?: EntityManager
  ) {
    const estudio = await this.citasRepository.obtenerEstudioPorEspecialidad(
      idEstudio,
      idEspecialidad,
      transaccion
    )
    if (!estudio) {
      throw new BadRequestException(
        'El estudio seleccionado no pertenece a la especialidad indicada'
      )
    }
    return estudio
  }

  // ===== Citas =====
  async listarCitas(filtros: FiltrosCitaDto): Promise<CitaResponseDto[]> {
    const citas = await this.citasRepository.listarCitas(filtros)
    return formatearCitas(citas)
  }

  async listarCitasPaginadas(
    filtros: FiltrosCitaPaginadoDto
  ): Promise<[CitaResponseDto[], number]> {
    const [citas, total] =
      await this.citasRepository.listarCitasPaginadas(filtros)

    return [formatearCitas(citas), total]
  }

  async listarMisCitas(filtros: FiltrosCitaDto): Promise<CitaResponseDto[]> {
    return await this.listarCitas({ ...filtros })
  }

  @Cron(process.env.CITAS_REVISION_DIARIA_CRON || '0 1 * * *')
  async actualizarCitasVencidas(): Promise<void> {
    const fechaCorte = dayjs().startOf('day').toDate()
    const usuarioAuditoria = '0'
    const rolEjecutor = 'SISTEMA'
    const actualizadas = await this.citasRepository.marcarCitasVencidas(
      fechaCorte,
      usuarioAuditoria,
      rolEjecutor
    )

    if (actualizadas > 0) {
      this.logger.info(
        `Citas vencidas actualizadas automáticamente: ${actualizadas}`
      )
    }
  }

  async listarHistorialCita(
    id: string,
    filtros: FiltrosHistorialCitaPaginadoDto
  ): Promise<[HistorialCitaResponseDto[], number]> {
    await this.obtenerCitaId(id)
    const [historial, total] =
      await this.citasRepository.listarHistorialCitaPaginado(id, filtros)
    return [formatearHistorialCitas(historial), total]
  }

  async obtenerCita(
    id: string,
    transaccion?: EntityManager
  ): Promise<CitaResponseDto> {
    const cita = await this.citasRepository.obtenerCitaConRelaciones(
      id,
      transaccion
    )
    if (!cita) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return formatearCita(cita)
  }

  async obtenerCitaId(id: string, transaccion?: EntityManager): Promise<Cita> {
    const cita = await this.citasRepository.obtenerCitaConRelaciones(
      id,
      transaccion
    )
    if (!cita) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return cita
  }

  async crearCita(
    dto: CrearCitaDto,
    usuarioAuditoria = '0',
    transaccion?: EntityManager
  ): Promise<CitaResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearCita(dto, usuarioAuditoria, nuevaTransaccion)
      }
      return await this.citasRepository.runTransaction(op)
    }

    if (!dto.idEspecialidad) {
      throw new BadRequestException('La especialidad es obligatoria')
    }

    const fechaInicio = new Date(dto.fechaInicio)
    const tipoCita = dto.tipoCita
    if (!tipoCita) {
      throw new BadRequestException('El tipo de cita es obligatorio')
    }
    let fechaFin: Date
    let idEstudio: string | null = null
    let esEstudio = false

    if (tipoCita === TipoCita.ESTUDIO) {
      if (!dto.idEstudio) {
        throw new BadRequestException(
          'El estudio es obligatorio para una cita de tipo ESTUDIO'
        )
      }
      const estudio = await this.resolverDuracionEstudio(
        dto.idEstudio,
        dto.idEspecialidad,
        transaccion
      )
      fechaFin = this.calcularFechaFin(fechaInicio, estudio.duracionMinutos)
      idEstudio = estudio.id
      esEstudio = true
    } else {
      const duracion = this.obtenerDuracionConsultaMinutos()
      fechaFin = this.calcularFechaFin(fechaInicio, duracion)
    }

    const estadoInicial = dto.idMedico
      ? CitasEstado.SOLICITADA
      : CitasEstado.CONFIRMADA

    const citaId = await this.citasRepository.crearCita(
      {
        detalle: dto.detalle,
        fechaInicio,
        fechaFin,
        estado: estadoInicial,
        idMedico: dto.idMedico,
        idPaciente: dto.idPaciente ?? null,
        idConsultorio: dto.idConsultorio ?? null,
        idEspecialidad: dto.idEspecialidad,
        idEstudio,
        esEstudio,
      },
      usuarioAuditoria,
      transaccion
    )
    if (!citaId) {
      throw new BadRequestException('No fue posible registrar la cita')
    }

    return await this.obtenerCita(citaId, transaccion)
  }

  async actualizarCita(
    id: string,
    dto: ActualizarCitaDto,
    usuarioAuditoria = '0',
    transaccion?: EntityManager
  ): Promise<CitaResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarCita(
          id,
          dto,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.citasRepository.runTransaction(op)
    }

    const cita = await this.obtenerCitaId(id, transaccion)

    const tipoCita = dto.tipoCita
    const idEspecialidad = dto.idEspecialidad

    if (!tipoCita) {
      throw new BadRequestException('El tipo de cita es obligatorio')
    }

    if (!idEspecialidad) {
      throw new BadRequestException('La especialidad es obligatoria')
    }

    const fechaInicio = new Date(dto.fechaInicio)

    let fechaFin: Date
    let idEstudio: string | null = null
    let esEstudio = false

    if (tipoCita === TipoCita.ESTUDIO) {
      if (!dto.idEstudio) {
        throw new BadRequestException(
          'El estudio es obligatorio para una cita de tipo ESTUDIO'
        )
      }
      const estudio = await this.resolverDuracionEstudio(
        dto.idEstudio,
        idEspecialidad,
        transaccion
      )
      fechaFin = this.calcularFechaFin(fechaInicio, estudio.duracionMinutos)
      idEstudio = estudio.id
      esEstudio = true
    } else {
      const duracion = this.obtenerDuracionConsultaMinutos()
      fechaFin = this.calcularFechaFin(fechaInicio, duracion)
    }

    const actualizado = await this.citasRepository.actualizarCita(
      cita,
      {
        detalle: dto.detalle,
        fechaInicio,
        fechaFin,
        idMedico: dto.idMedico,
        idPaciente: dto.idPaciente,
        idConsultorio: dto.idConsultorio,
        idEspecialidad,
        idEstudio,
        esEstudio,
      },
      usuarioAuditoria,
      transaccion
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }

    return await this.obtenerCita(id)
  }

  async actualizarEstadoCita(
    id: string,
    dto: ActualizarEstadoCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaResponseDto> {
    const actualizado = await this.citasRepository.actualizarEstadoCita(
      id,
      dto,
      usuarioAuditoria
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }

  async reprogramarCita(
    id: string,
    dto: ReprogramarCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaResponseDto> {
    const fechaInicio = new Date(dto.fechaInicio)
    const tipoCita = dto.tipoCita

    if (!tipoCita) {
      throw new BadRequestException('El tipo de cita es obligatorio')
    }

    let fechaFin: Date
    if (tipoCita === TipoCita.ESTUDIO) {
      if (!dto.idEstudio) {
        throw new BadRequestException(
          'El estudio es obligatorio para una cita de tipo ESTUDIO'
        )
      }
      const cita = await this.obtenerCitaId(id)
      if (!cita.idEspecialidad) {
        throw new BadRequestException(
          'La especialidad es obligatoria para reprogramar una cita de estudio'
        )
      }
      const estudio = await this.resolverDuracionEstudio(
        dto.idEstudio,
        cita.idEspecialidad
      )
      fechaFin = this.calcularFechaFin(fechaInicio, estudio.duracionMinutos)
    } else {
      const duracion = this.obtenerDuracionConsultaMinutos()
      fechaFin = this.calcularFechaFin(fechaInicio, duracion)
    }

    const actualizado = await this.citasRepository.reprogramarCita(
      id,
      { ...dto, fechaFin },
      usuarioAuditoria
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }

  async cancelarCita(
    id: string,
    dto: CancelarCitaDto,
    usuarioAuditoria = '0',
    rolEjecutor = 'SISTEMA'
  ): Promise<CitaResponseDto> {
    const actualizado = await this.citasRepository.cancelarCita(
      id,
      dto,
      usuarioAuditoria,
      rolEjecutor
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }
}
