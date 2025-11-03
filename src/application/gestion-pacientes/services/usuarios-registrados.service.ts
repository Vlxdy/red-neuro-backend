import { BaseService } from '@/common/base/base-service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { RolEnum } from '@/core/authorization/rol.enum'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import {
  formatearUsuarioRolRespuesta,
  formatearUsuariosRolesRespuesta,
} from '../utils/formateos'

@Injectable()
export class UsuariosRegistradosService extends BaseService {
  constructor(private usuarioRolRepositorio: UsuarioRolRepository) {
    super()
  }

  async listarUsuariosPorRol(params: PaginacionQueryDto, rol: RolEnum) {
    const [usuariosRoles, cantidad] =
      await this.usuarioRolRepositorio.listarUsuariosPorRol(params, rol)

    const usuariosResponse = formatearUsuariosRolesRespuesta(usuariosRoles)

    return [usuariosResponse, cantidad]
  }

  async obtenerUsuarioRegistroId(id: string) {
    const usuarioRol = await this.usuarioRolRepositorio.buscarPorId(id)
    if (!usuarioRol) {
      throw new NotFoundException('Usuario registrado no encontrado')
    }

    return formatearUsuarioRolRespuesta(usuarioRol)
  }
}
