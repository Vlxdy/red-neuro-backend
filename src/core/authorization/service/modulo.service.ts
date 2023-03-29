import { BaseService } from '../../../common/base/base-service'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ModuloRepository } from '../repository/modulo.repository'
import { CrearModuloDto, FiltroModuloDto } from '../dto/crear-modulo.dto'
import { Status } from '../../../common/constants'

import { Messages } from '../../../common/constants/response-messages'
import { ActualizarModuloDto } from '../dto/actualizar-modulo.dto'

@Injectable()
export class ModuloService extends BaseService {
  constructor(
    @Inject(ModuloRepository)
    private moduloRepositorio: ModuloRepository
  ) {
    super()
  }

  async listar(paginacionQueryDto: FiltroModuloDto) {
    return await this.moduloRepositorio.listar(paginacionQueryDto)
  }

  async listarTodo() {
    return await this.moduloRepositorio.obtenerModulosSubmodulos()
  }

  async crear(moduloDto: CrearModuloDto, usuarioAuditoria: string) {
    return await this.moduloRepositorio.crear(moduloDto, usuarioAuditoria)
  }

  async actualizar(
    id: string,
    moduloDto: ActualizarModuloDto,
    usuarioAuditoria: string
  ) {
    return await this.moduloRepositorio.actualizar(
      id,
      moduloDto,
      usuarioAuditoria
    )
  }

  async eliminar(id: string) {
    return await this.moduloRepositorio.eliminar(id)
  }

  async activar(id: string, usuarioAuditoria: string) {
    const modulo = await this.moduloRepositorio.buscarPorId(id)
    if (!modulo) {
      throw new NotFoundException(Messages.EXCEPTION_DEFAULT)
    }

    const actualizarModuloDto = new ActualizarModuloDto()
    actualizarModuloDto.estado = Status.ACTIVE

    await this.moduloRepositorio.actualizar(
      id,
      actualizarModuloDto,
      usuarioAuditoria
    )

    return {
      id,
    }
  }

  async inactivar(id: string, usuarioAuditoria: string) {
    const modulo = await this.moduloRepositorio.buscarPorId(id)
    if (!modulo) {
      throw new NotFoundException(Messages.EXCEPTION_DEFAULT)
    }

    const actualizarModuloDto = new ActualizarModuloDto()
    actualizarModuloDto.estado = Status.INACTIVE

    await this.moduloRepositorio.actualizar(
      id,
      actualizarModuloDto,
      usuarioAuditoria
    )

    return {
      id,
    }
  }
}
