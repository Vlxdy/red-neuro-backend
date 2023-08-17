import { BaseService } from '../../../common/base'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { RolRepository } from '../repository/rol.repository'
import { CrearRolDto } from '../dto/crear-rol.dto'
import { Messages } from '../../../common/constants/response-messages'
import { Status } from '../../../common/constants'
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto'

@Injectable()
export class RolService extends BaseService {
  constructor(
    @Inject(RolRepository)
    private rolRepositorio: RolRepository
  ) {
    super()
  }

  async listar() {
    return await this.rolRepositorio.listar()
  }

  async listarTodos(paginacionQueryDto: PaginacionQueryDto) {
    return await this.rolRepositorio.listarTodos(paginacionQueryDto)
  }

  async crear(rolDto: CrearRolDto, usuarioAuditoria: string) {
    return await this.rolRepositorio.crear(rolDto, usuarioAuditoria)
  }

  async actualizar(id: string, rolDto: CrearRolDto, usuarioAuditoria: string) {
    const rol = await this.rolRepositorio.buscarPorId(id)
    if (!rol) {
      throw new NotFoundException(Messages.NO_PERMISSION_FOUND)
    }

    await this.rolRepositorio.actualizar(id, rolDto, usuarioAuditoria)
    return { id }
  }

  async activar(idRol: string, usuarioAuditoria: string) {
    const rol = await this.rolRepositorio.buscarPorId(idRol)
    if (!rol) {
      throw new NotFoundException(Messages.NO_PERMISSION_FOUND)
    }

    const rolDto = new CrearRolDto()
    rolDto.estado = Status.ACTIVE
    await this.rolRepositorio.actualizar(idRol, rolDto, usuarioAuditoria)
    return { id: idRol, estado: rolDto.estado }
  }

  async inactivar(idRol: string, usuarioAuditoria: string) {
    const rol = await this.rolRepositorio.buscarPorId(idRol)
    if (!rol) {
      throw new NotFoundException(Messages.NO_PERMISSION_FOUND)
    }

    const rolDto = new CrearRolDto()
    rolDto.estado = Status.INACTIVE
    await this.rolRepositorio.actualizar(idRol, rolDto, usuarioAuditoria)
    return { id: idRol, estado: rolDto.estado }
  }
}
