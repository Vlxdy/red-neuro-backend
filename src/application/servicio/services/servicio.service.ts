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

  private async validarCategorias(
    categoriaIds: string[] = [],
    transaccion?: EntityManager
  ) {
    if (categoriaIds.length === 0) {
      return
    }

    const idsUnicos = Array.from(new Set(categoriaIds))
    const categorias = await this.servicioRepository.obtenerCategoriasPorIds(
      idsUnicos,
      transaccion
    )

    if (categorias.length !== idsUnicos.length) {
      throw new NotFoundException(Messages.CATEGORIA_NOT_FOUND)
    }
  }

  async listarServicios(
    paginacionQuery: ListarServiciosQueryDto
  ): Promise<[ServicioResponseDto[], number]> {
    const [servicios, total] =
      await this.servicioRepository.listarServiciosPaginado(paginacionQuery)
    return [formatearServicios(servicios), total]
  }

  async listarServiciosPorCategoria(
    categoriaId: string,
    paginacionQuery: ListarServiciosQueryDto
  ): Promise<[ServicioResponseDto[], number]> {
    const categoria =
      await this.servicioRepository.obtenerCategoriaPorId(categoriaId)

    if (!categoria) {
      throw new NotFoundException(Messages.CATEGORIA_NOT_FOUND)
    }

    const [servicios, total] =
      await this.servicioRepository.listarServiciosPorCategoriaPaginado(
        categoriaId,
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

    await this.validarCategorias(dto.categoriaIds ?? [], transaccion)

    const nuevoServicio = await this.servicioRepository.crearServicio(
      dto,
      usuarioAuditoria,
      transaccion
    )

    if (dto.categoriaIds && dto.categoriaIds.length > 0) {
      await this.servicioRepository.crearServicioCategorias(
        nuevoServicio.id,
        dto.categoriaIds,
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

    if (dto.categoriaIds !== undefined && dto.categoriaIds !== null) {
      await this.validarCategorias(dto.categoriaIds, transaccion)
      await this.servicioRepository.reemplazarServicioCategorias(
        servicio.id,
        dto.categoriaIds,
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
