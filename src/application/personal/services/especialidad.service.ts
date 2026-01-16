import { BaseService } from '@/common/base'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EspecialidadRepository } from '../repository/especialidad.repository'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import {
  ActualizarEspecialidadDto,
  CrearEspecialidadDto,
  EspecialidadResponseDto,
} from '../dto/especialidad.dto'
import {
  formatearEspecialidad,
  formatearEspecialidades,
} from '../utils/formateo-especialidad.utils'
import { EntityManager } from 'typeorm'
import { Messages } from '@/common/constants/response-messages'
import { EspecialidadEstado } from '../constants'

@Injectable()
export class EspecialidadService extends BaseService {
  constructor(
    @Inject(EspecialidadRepository)
    private readonly especialidadRepository: EspecialidadRepository
  ) {
    super()
  }

  async listarEspecialidades(
    paginacionQuery: PaginacionQueryDto
  ): Promise<[EspecialidadResponseDto[], number]> {
    const [especialidades, total] =
      await this.especialidadRepository.listarEspecialidadesPaginado(
        paginacionQuery
      )
    return [formatearEspecialidades(especialidades), total]
  }

  async obtenerEspecialidadPorId(id: string, transaccion?: EntityManager) {
    const especialidad =
      await this.especialidadRepository.obtenerEspecialidadPorId(
        id,
        transaccion
      )

    if (!especialidad) {
      throw new NotFoundException(Messages.ESPECIALIDAD_NOT_FOUND)
    }

    return especialidad
  }

  async crearEspecialidad(
    dto: CrearEspecialidadDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<EspecialidadResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearEspecialidad(
          dto,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.especialidadRepository.runTransaction(op)
    }

    const nuevaEspecialidad =
      await this.especialidadRepository.crearEspecialidad(
        dto,
        usuarioAuditoria,
        transaccion
      )

    return formatearEspecialidad(nuevaEspecialidad)
  }

  async actualizarEspecialidad(
    id: string,
    dto: ActualizarEspecialidadDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<EspecialidadResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarEspecialidad(
          id,
          dto,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.especialidadRepository.runTransaction(op)
    }

    const especialidad = await this.obtenerEspecialidadPorId(id, transaccion)
    const especialidadActualizada =
      await this.especialidadRepository.actualizarEspecialidad(
        especialidad,
        dto,
        usuarioAuditoria,
        transaccion
      )

    return formatearEspecialidad(especialidadActualizada)
  }

  async eliminarEspecialidad(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<EspecialidadResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.eliminarEspecialidad(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.especialidadRepository.runTransaction(op)
    }

    const especialidad = await this.obtenerEspecialidadPorId(id, transaccion)
    await this.especialidadRepository.eliminarEspecialidad(id, transaccion)

    especialidad.usuarioModificacion = usuarioAuditoria
    return formatearEspecialidad(especialidad)
  }

  async cambiarEstadoEspecialidad(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<EspecialidadResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.cambiarEstadoEspecialidad(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.especialidadRepository.runTransaction(op)
    }

    const especialidad = await this.obtenerEspecialidadPorId(id, transaccion)

    const especialidadActualizada =
      await this.especialidadRepository.actualizarEspecialidad(
        especialidad,
        {
          estado:
            especialidad.estado === EspecialidadEstado.ACTIVO
              ? EspecialidadEstado.INACTIVO
              : EspecialidadEstado.ACTIVO,
        },
        usuarioAuditoria,
        transaccion
      )

    return formatearEspecialidad(especialidadActualizada)
  }
}
