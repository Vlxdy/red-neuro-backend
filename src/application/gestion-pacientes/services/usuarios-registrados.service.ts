import { BaseService } from '@/common/base/base-service'
import { Injectable } from '@nestjs/common'
import { RolEnum } from '@/core/authorization/rol.enum'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { UsuariosRegistradosRepository } from '../repositories/usuarios-registrados.repository'

@Injectable()
export class UsuariosRegistradosService extends BaseService {
  constructor(
    private usuarioRegistradoRepositorio: UsuariosRegistradosRepository
  ) {
    super()
  }

  async listarUsuariosPorRol(params: PaginacionQueryDto, rol: RolEnum) {
    const usuarios =
      await this.usuarioRegistradoRepositorio.listarUsuariosPorRol(params, rol)

    const usuariosResponse = usuarios[0].map((usuario) => {
      return {
        id: usuario.usuarioRol[0].id,
        nombres: usuario.persona.nombres,
        primerApellido: usuario.persona.primerApellido,
        segundoApellido: usuario.persona.segundoApellido,
        nroDocumento: usuario.persona.nroDocumento,
        tipoDocumento: usuario.persona.tipoDocumento,
        genero: usuario.persona.genero,
        correoElectronico: usuario.correoElectronico,
        estado: usuario.usuarioRol[0].estado,
      }
    })

    return [usuariosResponse, usuarios[1]]
  }
}
