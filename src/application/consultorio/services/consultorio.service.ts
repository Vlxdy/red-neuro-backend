import { BaseService } from '@/common/base'
import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { ConsultorioRepository } from '../repository/consultorio.repository'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import {
  ActualizarConsultorioDto,
  ConsultorioResponseDto,
  CrearConsultorioDto,
} from '../dto/consultorio.dto'
import {
  formatearConsultorio,
  formatearConsultorios,
} from '../utils/formateo.consultorio'
import { EntityManager } from 'typeorm'
import { Messages } from '@/common/constants/response-messages'
import { ConsultorioEstado } from '../constants'

@Injectable()
export class ConsultorioService extends BaseService {
  constructor(
    @Inject(ConsultorioRepository)
    private readonly consultorioRepository: ConsultorioRepository
  ) {
    super()
  }

  async listarConsultorios(
    paginacionQuery: PaginacionQueryDto
  ): Promise<[ConsultorioResponseDto[], number]> {
    const [consultorios, total] =
      await this.consultorioRepository.listarConsultoriosPaginado(
        paginacionQuery
      )
    return [formatearConsultorios(consultorios), total]
  }
  async crearConsultorio(
    dto: CrearConsultorioDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<ConsultorioResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearConsultorio(
          dto,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.consultorioRepository.runTransaction(op)
    }

    const nuevoConsultorio = await this.consultorioRepository.crearConsultorio(
      dto,
      usuarioAuditoria,
      transaccion
    )
    return formatearConsultorio(nuevoConsultorio)
  }

  async actualizarConsultorio(
    id: string,
    dto: ActualizarConsultorioDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarConsultorio(
          id,
          dto,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.consultorioRepository.runTransaction(op)
    }

    const consultorio = await this.obtenerConsultorioPorId(id, transaccion)

    const consultorioActualizado =
      await this.consultorioRepository.actualizarConsultorio(
        consultorio,
        dto,
        usuarioAuditoria,
        transaccion
      )
    return formatearConsultorio(consultorioActualizado)
  }

  async obtenerConsultorioPorId(id: string, transaccion?: EntityManager) {
    const consultorio =
      await this.consultorioRepository.obtenerConsultorioPorId(id, transaccion)

    if (!consultorio) {
      throw new NotFoundException(Messages.CONSULTORIO_NOT_FOUND)
    }

    return consultorio
  }

  async cambiarEstadoConsultorio(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.cambiarEstadoConsultorio(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.consultorioRepository.runTransaction(op)
    }

    const consultorio = await this.obtenerConsultorioPorId(id, transaccion)

    const consultorioActualizado =
      await this.consultorioRepository.actualizarConsultorio(
        consultorio,
        {
          estado:
            consultorio.estado === ConsultorioEstado.ACTIVO
              ? ConsultorioEstado.INACTIVO
              : ConsultorioEstado.ACTIVO,
        },
        usuarioAuditoria,
        transaccion
      )
    return formatearConsultorio(consultorioActualizado)
  }
}
