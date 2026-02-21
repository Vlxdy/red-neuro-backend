import { BaseService } from '@/common/base'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ServicioRepository } from '../repository/estudio.repository'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import {
  ActualizarServicioDto,
  AsignarEspecialidadDto,
  CrearServicioDto,
  ServicioResponseDto,
} from '../dto/estudio.dto'
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

  async listarServicios(
    paginacionQuery: PaginacionQueryDto
  ): Promise<[ServicioResponseDto[], number]> {
    const [servicios, total] =
      await this.servicioRepository.listarServiciosPaginado(paginacionQuery)
    return [formatearServicios(servicios), total]
  }

  async listarServiciosPorEspecialidad(
    especialidadId: string,
    paginacionQuery: PaginacionQueryDto
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

    const nuevoServicio = await this.servicioRepository.crearServicio(
      dto,
      usuarioAuditoria,
      transaccion
    )
    return formatearServicio(nuevoServicio)
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
    const servicioActualizado =
      await this.servicioRepository.actualizarServicio(
        servicio,
        dto,
        usuarioAuditoria,
        transaccion
      )
    return formatearServicio(servicioActualizado)
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

  async asignarEspecialidad(
    id: string,
    dto: AsignarEspecialidadDto,
    transaccion?: EntityManager
  ): Promise<ServicioResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.asignarEspecialidad(id, dto, nuevaTransaccion)
      }
      return await this.servicioRepository.runTransaction(op)
    }

    const servicio = await this.obtenerServicioPorId(id, transaccion)
    const especialidad = await this.servicioRepository.obtenerEspecialidadPorId(
      dto.especialidadId,
      transaccion
    )

    if (!especialidad) {
      throw new NotFoundException(Messages.ESPECIALIDAD_NOT_FOUND)
    }

    const servicioActualizado =
      await this.servicioRepository.actualizarServicio(
        servicio,
        {
          idEspecialidad: especialidad.id,
        },
        '0',
        transaccion
      )

    return formatearServicio(servicioActualizado)
  }
}
