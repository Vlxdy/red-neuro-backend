import { BaseService } from '@/common/base'
import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { LugarRepository } from '../repository/lugar.repository'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import {
  ActualizarLugarDto,
  CrearLugarDto,
  LugarResponseDto,
} from '../dto/lugar.dto'
import { formatearLugar, formatearLugares } from '../utils/formateo.lugar'
import { EntityManager } from 'typeorm'
import { LugarEstado } from '../constants'
import { Messages } from '@/common/constants/response-messages'

@Injectable()
export class LugarService extends BaseService {
  constructor(
    @Inject(LugarRepository)
    private readonly repository: LugarRepository
  ) {
    super()
  }

  async listar(
    paginacionQuery: PaginacionQueryDto
  ): Promise<[LugarResponseDto[], number]> {
    const [rows, total] = await this.repository.listarPaginado(paginacionQuery)
    return [formatearLugares(rows), total]
  }

  async crear(
    dto: CrearLugarDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<LugarResponseDto> {
    if (!transaccion) {
      return await this.repository.runTransaction((trx) =>
        this.crear(dto, usuarioAuditoria, trx)
      )
    }
    const creada = await this.repository.crear(
      dto,
      usuarioAuditoria,
      transaccion
    )
    return formatearLugar(creada)
  }

  async actualizar(
    id: string,
    dto: ActualizarLugarDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<LugarResponseDto> {
    if (!transaccion) {
      return await this.repository.runTransaction((trx) =>
        this.actualizar(id, dto, usuarioAuditoria, trx)
      )
    }
    const lugar = await this.obtenerPorId(id, transaccion)
    const actualizada = await this.repository.actualizar(
      lugar,
      dto,
      usuarioAuditoria,
      transaccion
    )
    return formatearLugar(actualizada)
  }

  async cambiarEstado(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<LugarResponseDto> {
    if (!transaccion) {
      return await this.repository.runTransaction((trx) =>
        this.cambiarEstado(id, usuarioAuditoria, trx)
      )
    }
    const lugar = await this.obtenerPorId(id, transaccion)
    const nuevoEstado =
      lugar.estado === LugarEstado.ACTIVO
        ? LugarEstado.INACTIVO
        : LugarEstado.ACTIVO
    const actualizada = await this.repository.actualizar(
      lugar,
      { estado: nuevoEstado },
      usuarioAuditoria,
      transaccion
    )
    const resp = formatearLugar(actualizada)
    this.logger.info(
      `${Messages.SUCCESS_UPDATE} ${nuevoEstado === LugarEstado.ACTIVO ? 'activada' : 'desactivada'}`
    )
    return resp
  }

  async obtenerPorId(id: string, transaccion?: EntityManager) {
    const lugar = await this.repository.obtenerPorId(id, transaccion)
    if (!lugar) {
      throw new NotFoundException('La institución solicitada no existe')
    }
    return lugar
  }
}
