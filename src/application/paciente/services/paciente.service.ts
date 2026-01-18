import { BaseService } from '@/common/base'
import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { Messages } from '@/common/constants/response-messages'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { PacienteRepository } from '../repository/paciente.repository'
import {
  ActualizarPacienteDto,
  CrearPacienteDto,
  PacienteResponseDto,
} from '../dto/paciente.dto'
import {
  formatearPaciente,
  formatearPacientes,
} from '../utils/formateo-paciente'
import { PacienteEstado } from '../constants'

@Injectable()
export class PacienteService extends BaseService {
  constructor(
    @Inject(PacienteRepository)
    private readonly pacienteRepository: PacienteRepository
  ) {
    super()
  }

  async listarPacientes(
    paginacionQuery: PaginacionQueryDto
  ): Promise<[PacienteResponseDto[], number]> {
    const [pacientes, total] =
      await this.pacienteRepository.listarPacientesPaginado(paginacionQuery)

    return [formatearPacientes(pacientes), total]
  }

  async obtenerPacientePorId(id: string, transaccion?: EntityManager) {
    const paciente = await this.pacienteRepository.obtenerPacientePorId(
      id,
      transaccion
    )

    if (!paciente) {
      throw new NotFoundException(Messages.PACIENTE_NOT_FOUND)
    }

    return paciente
  }

  async crearPaciente(
    dto: CrearPacienteDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<PacienteResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearPaciente(dto, usuarioAuditoria, nuevaTransaccion)
      }
      return await this.pacienteRepository.runTransaction(op)
    }

    const nuevo = await this.pacienteRepository.crearPaciente(
      dto,
      usuarioAuditoria,
      transaccion
    )
    return formatearPaciente(nuevo)
  }

  async actualizarPaciente(
    id: string,
    dto: ActualizarPacienteDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<PacienteResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarPaciente(
          id,
          dto,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.pacienteRepository.runTransaction(op)
    }

    const paciente = await this.obtenerPacientePorId(id, transaccion)
    const actualizado = await this.pacienteRepository.actualizarPaciente(
      paciente,
      dto,
      usuarioAuditoria,
      transaccion
    )

    return formatearPaciente(actualizado)
  }

  async eliminarPaciente(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<PacienteResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.eliminarPaciente(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.pacienteRepository.runTransaction(op)
    }

    const paciente = await this.obtenerPacientePorId(id, transaccion)
    await this.pacienteRepository.eliminarPaciente(id, transaccion)

    return formatearPaciente({
      ...paciente,
      usuarioModificacion: usuarioAuditoria,
    })
  }

  async cambiarEstadoPaciente(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<PacienteResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.cambiarEstadoPaciente(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.pacienteRepository.runTransaction(op)
    }

    const paciente = await this.obtenerPacientePorId(id, transaccion)

    const pacienteActualizado =
      await this.pacienteRepository.actualizarPaciente(
        paciente,
        {
          estado:
            paciente.estado === PacienteEstado.ACTIVO
              ? PacienteEstado.INACTIVO
              : PacienteEstado.ACTIVO,
        },
        usuarioAuditoria,
        transaccion
      )

    return formatearPaciente(pacienteActualizado)
  }
}
