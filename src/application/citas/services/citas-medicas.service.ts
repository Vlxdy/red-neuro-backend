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
  ReprogramarCitaDto,
} from '../dto/cita.dto'

import { CitasMedicasRepository } from '../repository/citas-medicas.repository'
import { formatearCita, formatearCitas } from '../utils/formatear-citas'
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

  private calcularFechaFin(fechaInicio: Date, duracionMinutos: number): Date {
    return dayjs(fechaInicio).add(duracionMinutos, 'minute').toDate()
  }

  private async resolverServicio(
    idServicio: string,
    tipoCita: TipoCita,
    idEspecialidad?: string,
    transaccion?: EntityManager
  ) {
    const servicio = await this.citasRepository.obtenerServicioPorId(
      idServicio,
      transaccion
    )

    if (!servicio) {
      throw new BadRequestException('El servicio seleccionado no existe')
    }

    if (servicio.tipo !== tipoCita) {
      throw new BadRequestException(
        'El servicio seleccionado no coincide con el tipo de cita'
      )
    }

    if (idEspecialidad && servicio.idEspecialidad) {
      if (String(servicio.idEspecialidad) !== String(idEspecialidad)) {
        throw new BadRequestException(
          'El servicio seleccionado no pertenece a la especialidad indicada'
        )
      }
    }

    return servicio
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
    const idEjecutor = '0'
    const actualizadas = await this.citasRepository.marcarCitasVencidas(
      fechaCorte,
      usuarioAuditoria,
      idEjecutor
    )

    if (actualizadas > 0) {
      this.logger.info(
        `Citas vencidas actualizadas automáticamente: ${actualizadas}`
      )
    }
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
    transaccion?: EntityManager,
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearCita(
          dto,
          usuarioAuditoria,
          nuevaTransaccion,
          idEjecutor
        )
      }
      return await this.citasRepository.runTransaction(op)
    }

    const fechaInicio = dayjs(dto.fechaInicio).toDate()
    const tipoCita = dto.tipoCita
    if (!tipoCita) {
      throw new BadRequestException('El tipo de cita es obligatorio')
    }

    const idServicio = dto.idServicio
    if (!idServicio) {
      throw new BadRequestException('El servicio es obligatorio para la cita')
    }

    const servicio = await this.resolverServicio(
      idServicio,
      tipoCita,
      dto.idEspecialidad,
      transaccion
    )
    const fechaFin = this.calcularFechaFin(
      fechaInicio,
      servicio.duracionMinutos
    )

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
        idEspecialidad: dto.idEspecialidad ?? null,
        idServicio: servicio.id,
        tipoCita,
      },
      usuarioAuditoria,
      idEjecutor,
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
    transaccion?: EntityManager,
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarCita(
          id,
          dto,
          usuarioAuditoria,
          nuevaTransaccion,
          idEjecutor
        )
      }
      return await this.citasRepository.runTransaction(op)
    }

    const cita = await this.obtenerCitaId(id, transaccion)

    const updateData: Partial<Cita> = {}

    if (dto.detalle !== undefined) {
      updateData.detalle = dto.detalle
    }

    if (dto.idMedico !== undefined) {
      updateData.idMedico = dto.idMedico
      updateData.estado = CitasEstado.SOLICITADA
    }

    if (dto.idPaciente !== undefined) {
      updateData.idPaciente = dto.idPaciente
    }

    if (dto.idConsultorio !== undefined) {
      updateData.idConsultorio = dto.idConsultorio
    }

    if (dto.idEspecialidad !== undefined) {
      updateData.idEspecialidad = dto.idEspecialidad
    }

    const requiereRecalculo =
      dto.fechaInicio !== undefined ||
      dto.idServicio !== undefined ||
      dto.tipoCita !== undefined ||
      dto.idEspecialidad !== undefined

    if (requiereRecalculo) {
      const fechaInicio = dto.fechaInicio
        ? dayjs(dto.fechaInicio).toDate()
        : cita.fechaInicio

      const tipoCita = dto.tipoCita ?? cita.tipoCita ?? TipoCita.CONSULTA
      const idEspecialidad =
        dto.idEspecialidad ?? cita.idEspecialidad ?? undefined
      const idServicio = dto.idServicio ?? cita.idServicio

      if (!idServicio) {
        throw new BadRequestException('El servicio es obligatorio para la cita')
      }

      const servicio = await this.resolverServicio(
        idServicio,
        tipoCita,
        idEspecialidad,
        transaccion
      )

      const fechaFin = this.calcularFechaFin(
        fechaInicio ?? dayjs(cita.fechaInicio).toDate(),
        servicio.duracionMinutos
      )

      updateData.fechaInicio = fechaInicio
      updateData.fechaFin = fechaFin
      updateData.idServicio = servicio.id
      updateData.tipoCita = tipoCita
    }

    const actualizado = await this.citasRepository.actualizarCita(
      cita,
      updateData,
      usuarioAuditoria,
      idEjecutor,
      transaccion
    )

    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }

    return await this.obtenerCita(id, transaccion)
  }

  async actualizarEstadoCita(
    id: string,
    dto: ActualizarEstadoCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    const actualizado = await this.citasRepository.actualizarEstadoCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }

  async reprogramarCita(
    id: string,
    dto: ReprogramarCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    const fechaInicio = dayjs(dto.fechaInicio).toDate()
    const tipoCita = dto.tipoCita

    if (!tipoCita) {
      throw new BadRequestException('El tipo de cita es obligatorio')
    }

    const cita = await this.obtenerCitaId(id)
    const idServicio = dto.idServicio ?? cita.idServicio

    if (!idServicio) {
      throw new BadRequestException('El servicio es obligatorio para la cita')
    }

    const servicio = await this.resolverServicio(
      idServicio,
      tipoCita,
      cita.idEspecialidad ?? undefined
    )
    const fechaFin = this.calcularFechaFin(
      fechaInicio,
      servicio.duracionMinutos
    )

    const actualizado = await this.citasRepository.reprogramarCita(
      id,
      { ...dto, idServicio: servicio.id, fechaFin },
      usuarioAuditoria,
      idEjecutor
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
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    const actualizado = await this.citasRepository.cancelarCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }
}
