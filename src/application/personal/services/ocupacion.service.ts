import { BaseService } from '@/common/base'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { OcupacionRepository } from '../repository/ocupacion.repository'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import {
  ActualizarOcupacionDto,
  CrearOcupacionDto,
  OcupacionResponseDto,
} from '../dto/ocupacion.dto'

import { EntityManager } from 'typeorm'
import { Messages } from '@/common/constants/response-messages'
import { OcupacionEstado } from '../constants'
import {
  formatearOcupacion,
  formatearOcupaciones,
} from '../utils/formateo-ocupacion.utils'

@Injectable()
export class OcupacionService extends BaseService {
  constructor(
    @Inject(OcupacionRepository)
    private readonly ocupacionRepository: OcupacionRepository
  ) {
    super()
  }

  async listarOcupaciones(
    paginacionQuery: PaginacionQueryDto
  ): Promise<[OcupacionResponseDto[], number]> {
    const [ocupaciones, total] =
      await this.ocupacionRepository.listarOcupacionesPaginado(paginacionQuery)
    return [formatearOcupaciones(ocupaciones), total]
  }

  async obtenerOcupacionPorId(id: string, transaccion?: EntityManager) {
    const ocupacion = await this.ocupacionRepository.obtenerOcupacionPorId(
      id,
      transaccion
    )

    if (!ocupacion) {
      throw new NotFoundException(Messages.OCUPACION_NOT_FOUND)
    }

    return ocupacion
  }

  async crearOcupacion(
    dto: CrearOcupacionDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<OcupacionResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearOcupacion(
          dto,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.ocupacionRepository.runTransaction(op)
    }

    const nuevaOcupacion = await this.ocupacionRepository.crearOcupacion(
      dto,
      usuarioAuditoria,
      transaccion
    )

    return formatearOcupacion(nuevaOcupacion)
  }

  async actualizarOcupacion(
    id: string,
    dto: ActualizarOcupacionDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<OcupacionResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarOcupacion(
          id,
          dto,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.ocupacionRepository.runTransaction(op)
    }

    const ocupacion = await this.obtenerOcupacionPorId(id, transaccion)
    const ocupacionActualizada =
      await this.ocupacionRepository.actualizarOcupacion(
        ocupacion,
        dto,
        usuarioAuditoria,
        transaccion
      )

    return formatearOcupacion(ocupacionActualizada)
  }

  async eliminarOcupacion(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<OcupacionResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.eliminarOcupacion(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.ocupacionRepository.runTransaction(op)
    }

    const ocupacion = await this.obtenerOcupacionPorId(id, transaccion)
    await this.ocupacionRepository.eliminarOcupacion(id, transaccion)

    ocupacion.usuarioModificacion = usuarioAuditoria
    return formatearOcupacion(ocupacion)
  }

  async cambiarEstadoOcupacion(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<OcupacionResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.cambiarEstadoOcupacion(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.ocupacionRepository.runTransaction(op)
    }

    const ocupacion = await this.obtenerOcupacionPorId(id, transaccion)

    const ocupacionActualizada =
      await this.ocupacionRepository.actualizarOcupacion(
        ocupacion,
        {
          estado:
            ocupacion.estado === OcupacionEstado.ACTIVO
              ? OcupacionEstado.INACTIVO
              : OcupacionEstado.ACTIVO,
        },
        usuarioAuditoria,
        transaccion
      )

    return formatearOcupacion(ocupacionActualizada)
  }
}
