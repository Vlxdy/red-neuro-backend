import { BaseService } from '@/common/base'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ServicioRepository } from '../repository/servicio.repository'
import {
  ActualizarServicioDto,
  CrearServicioDto,
  ListarServiciosQueryDto,
  ServicioResponseDto,
} from '../dto/servicio.dto'
import {
  formatearServicio,
  formatearServicios,
} from '../utils/formateo.estudio'
import { EntityManager } from 'typeorm'
import { Messages } from '@/common/constants/response-messages'
import { ServicioEstado } from '../constants'

@Injectable()
export class ServicioService extends BaseService {
  constructor(
    @Inject(ServicioRepository)
    private readonly servicioRepository: ServicioRepository
  ) {
    super()
  }

  private async validarEspecialidades(
    especialidadIds: string[] = [],
    transaccion?: EntityManager
  ) {
    if (especialidadIds.length === 0) {
      return
    }

    const idsUnicos = Array.from(new Set(especialidadIds))
    const especialidades =
      await this.servicioRepository.obtenerEspecialidadesPorIds(
        idsUnicos,
        transaccion
      )

    if (especialidades.length !== idsUnicos.length) {
      throw new NotFoundException(Messages.ESPECIALIDAD_NOT_FOUND)
    }
  }

  async listarServicios(
    paginacionQuery: ListarServiciosQueryDto
  ): Promise<[ServicioResponseDto[], number]> {
    const [servicios, total] =
      await this.servicioRepository.listarServiciosPaginado(paginacionQuery)
    return [formatearServicios(servicios), total]
  }

  async listarServiciosPorEspecialidad(
    especialidadId: string,
    paginacionQuery: ListarServiciosQueryDto
  ): Promise<[ServicioResponseDto[], number]> {
    const especialidad =
      await this.servicioRepository.obtenerEspecialidadPorId(especialidadId)

    if (!especialidad) {
      throw new NotFoundException(Messages.ESPECIALIDAD_NOT_FOUND)
    }

    const [servicios, total] =
      await this.servicioRepository.listarServiciosPorEspecialidadPaginado(
        especialidadId,
        paginacionQuery
      )
    return [formatearServicios(servicios), total]
  }

  async obtenerServicioPorId(id: string, transaccion?: EntityManager) {
    const servicio = await this.servicioRepository.obtenerServicioPorId(
      id,
      transaccion
    )

    if (!servicio) {
      throw new NotFoundException(Messages.SERVICIO_NOT_FOUND)
    }

    return servicio
  }

  async crearServicio(
    dto: CrearServicioDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<ServicioResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearServicio(dto, usuarioAuditoria, nuevaTransaccion)
      }
      return await this.servicioRepository.runTransaction(op)
    }

    await this.validarEspecialidades(dto.especialidadIds ?? [], transaccion)

    const nuevoServicio = await this.servicioRepository.crearServicio(
      dto,
      usuarioAuditoria,
      transaccion
    )

    if (dto.especialidadIds && dto.especialidadIds.length > 0) {
      await this.servicioRepository.crearServicioEspecialidades(
        nuevoServicio.id,
        dto.especialidadIds,
        usuarioAuditoria,
        transaccion
      )
    }

    return formatearServicio(
      await this.obtenerServicioPorId(nuevoServicio.id, transaccion)
    )
  }

  async actualizarServicio(
    id: string,
    dto: ActualizarServicioDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<ServicioResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarServicio(
          id,
          dto,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.servicioRepository.runTransaction(op)
    }

    const servicio = await this.obtenerServicioPorId(id, transaccion)

    if (dto.especialidadIds !== undefined && dto.especialidadIds !== null) {
      await this.validarEspecialidades(dto.especialidadIds, transaccion)
      await this.servicioRepository.reemplazarServicioEspecialidades(
        servicio.id,
        dto.especialidadIds,
        usuarioAuditoria,
        transaccion
      )
    }

    await this.servicioRepository.actualizarServicio(
      servicio,
      dto,
      usuarioAuditoria,
      transaccion
    )

    return formatearServicio(await this.obtenerServicioPorId(id, transaccion))
  }

  async eliminarServicio(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<ServicioResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.eliminarServicio(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.servicioRepository.runTransaction(op)
    }

    const servicio = await this.obtenerServicioPorId(id, transaccion)
    await this.servicioRepository.eliminarServicio(id, transaccion)

    servicio.usuarioModificacion = usuarioAuditoria
    return formatearServicio(servicio)
  }

  async cambiarEstadoServicio(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<ServicioResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.cambiarEstadoServicio(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.servicioRepository.runTransaction(op)
    }

    const servicio = await this.obtenerServicioPorId(id, transaccion)

    const servicioActualizado =
      await this.servicioRepository.actualizarServicio(
        servicio,
        {
          estado:
            servicio.estado === ServicioEstado.ACTIVO
              ? ServicioEstado.INACTIVO
              : ServicioEstado.ACTIVO,
        },
        usuarioAuditoria,
        transaccion
      )

    return formatearServicio(servicioActualizado)
  }
}
