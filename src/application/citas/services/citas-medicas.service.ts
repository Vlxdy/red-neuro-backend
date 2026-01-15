import { BaseService } from '@/common/base'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common'
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

@Injectable()
export class CitasMedicasService extends BaseService {
  constructor(
    @Inject(CitasMedicasRepository)
    private readonly citasRepository: CitasMedicasRepository
  ) {
    super()
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

  async obtenerCita(id: string): Promise<CitaResponseDto> {
    const cita = await this.citasRepository.obtenerCitaConRelaciones(id)
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

    const citaId = await this.citasRepository.crearCita(
      dto,
      usuarioAuditoria,
      transaccion
    )
    if (!citaId) {
      throw new BadRequestException('No fue posible registrar la cita')
    }

    return await this.obtenerCita(citaId)
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
    const actualizado = await this.citasRepository.actualizarCita(
      cita,
      dto,
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
    const actualizado = await this.citasRepository.reprogramarCita(
      id,
      dto,
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
    usuarioAuditoria = '0'
  ): Promise<CitaResponseDto> {
    const actualizado = await this.citasRepository.cancelarCita(
      id,
      dto,
      usuarioAuditoria
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }
}
