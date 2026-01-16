import { BaseService } from '@/common/base'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EstudioRepository } from '../repository/estudio.repository'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import {
  ActualizarEstudioDto,
  AsignarEspecialidadDto,
  CrearEstudioDto,
  EstudioResponseDto,
} from '../dto/estudio.dto'
import { formatearEstudio, formatearEstudios } from '../utils/formateo.estudio'
import { EntityManager } from 'typeorm'
import { Messages } from '@/common/constants/response-messages'
import { EstudioEstado } from '../constants'

@Injectable()
export class EstudioService extends BaseService {
  constructor(
    @Inject(EstudioRepository)
    private readonly estudioRepository: EstudioRepository
  ) {
    super()
  }

  async listarEstudios(
    paginacionQuery: PaginacionQueryDto
  ): Promise<[EstudioResponseDto[], number]> {
    const [estudios, total] =
      await this.estudioRepository.listarEstudiosPaginado(paginacionQuery)
    return [formatearEstudios(estudios), total]
  }

  async obtenerEstudioPorId(id: string, transaccion?: EntityManager) {
    const estudio = await this.estudioRepository.obtenerEstudioPorId(
      id,
      transaccion
    )

    if (!estudio) {
      throw new NotFoundException(Messages.ESTUDIO_NOT_FOUND)
    }

    return estudio
  }

  async crearEstudio(
    dto: CrearEstudioDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<EstudioResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearEstudio(dto, usuarioAuditoria, nuevaTransaccion)
      }
      return await this.estudioRepository.runTransaction(op)
    }

    const nuevoEstudio = await this.estudioRepository.crearEstudio(
      dto,
      usuarioAuditoria,
      transaccion
    )
    return formatearEstudio(nuevoEstudio)
  }

  async actualizarEstudio(
    id: string,
    dto: ActualizarEstudioDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<EstudioResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarEstudio(
          id,
          dto,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.estudioRepository.runTransaction(op)
    }

    const estudio = await this.obtenerEstudioPorId(id, transaccion)
    const estudioActualizado = await this.estudioRepository.actualizarEstudio(
      estudio,
      dto,
      usuarioAuditoria,
      transaccion
    )
    return formatearEstudio(estudioActualizado)
  }

  async eliminarEstudio(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<EstudioResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.eliminarEstudio(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.estudioRepository.runTransaction(op)
    }

    const estudio = await this.obtenerEstudioPorId(id, transaccion)
    await this.estudioRepository.eliminarEstudio(id, transaccion)

    return formatearEstudio({
      ...estudio,
      usuarioModificacion: usuarioAuditoria,
    })
  }

  async cambiarEstadoEstudio(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<EstudioResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.cambiarEstadoEstudio(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }
      return await this.estudioRepository.runTransaction(op)
    }

    const estudio = await this.obtenerEstudioPorId(id, transaccion)

    const estudioActualizado = await this.estudioRepository.actualizarEstudio(
      estudio,
      {
        estado:
          estudio.estado === EstudioEstado.ACTIVO
            ? EstudioEstado.INACTIVO
            : EstudioEstado.ACTIVO,
      },
      usuarioAuditoria,
      transaccion
    )

    return formatearEstudio(estudioActualizado)
  }

  async asignarEspecialidad(
    id: string,
    dto: AsignarEspecialidadDto,
    transaccion?: EntityManager
  ): Promise<EstudioResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.asignarEspecialidad(id, dto, nuevaTransaccion)
      }
      return await this.estudioRepository.runTransaction(op)
    }

    const estudio = await this.obtenerEstudioPorId(id, transaccion)
    const especialidad = await this.estudioRepository.obtenerEspecialidadPorId(
      dto.especialidadId,
      transaccion
    )

    if (!especialidad) {
      throw new NotFoundException(Messages.ESPECIALIDAD_NOT_FOUND)
    }

    const existente =
      await this.estudioRepository.buscarRelacionEstudioEspecialidad(
        id,
        dto.especialidadId,
        transaccion
      )

    if (!existente) {
      await this.estudioRepository.crearRelacionEstudioEspecialidad(
        estudio,
        especialidad,
        transaccion
      )
    }

    const estudioActualizado = await this.obtenerEstudioPorId(id, transaccion)
    return formatearEstudio(estudioActualizado)
  }
}
