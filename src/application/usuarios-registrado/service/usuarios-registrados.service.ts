import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { RolEnum } from '@/core/authorization/rol.enum'
import { Messages } from '@/common/constants/response-messages'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { UsuariosRegistradosRepository } from '../repository/usuarios-registrados.repository'
import { UsuariosRegistradosResponse } from '../dto/usuarios-registrados.dto'

@Injectable()
export class UsuariosRegistradosService extends BaseService {
  constructor(
    @Inject(UsuarioRolRepository)
    private usuarioRolRepositorio: UsuarioRolRepository,
    private usuarioRegistradoRepositorio: UsuariosRegistradosRepository
  ) {
    super()
  }

  async obtenerMedico(idUsuarioRol: string, transaccion?: EntityManager) {
    const usuarioRol = await this.usuarioRolRepositorio.buscarPorId(
      idUsuarioRol,
      transaccion
    )
    if (!usuarioRol) {
      throw new NotFoundException(Messages.MEDICO_NOT_FOUND)
    }
    if (usuarioRol.rol.rol === RolEnum.NUTRICIONISTA) return usuarioRol
    throw new NotFoundException(Messages.MEDICO_NOT_FOUND)
  }

  async obtenerPaciente(idUsuarioRol: string, transaccion?: EntityManager) {
    const usuarioRol = await this.usuarioRolRepositorio.buscarPorId(
      idUsuarioRol,
      transaccion
    )
    if (!usuarioRol) {
      throw new NotFoundException(Messages.PACIENTE_NOT_FOUND)
    }
    if (usuarioRol.rol.rol === RolEnum.PACIENTE) return usuarioRol
    throw new NotFoundException(Messages.PACIENTE_NOT_FOUND)
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
  async listarPacientePorMedico(
    params: PaginacionQueryDto,
    idMedico: string
  ): Promise<[UsuariosRegistradosResponse[], number]> {
    const [usuarios, total] =
      await this.usuarioRegistradoRepositorio.listarPacientesPorMedico(
        idMedico,
        params
      )

    return [
      usuarios.map((usuario) => ({
        id: usuario.usuarioRol[0].id,
        nombres: usuario.persona.nombres,
        correoElectronico: usuario.correoElectronico,
        estado: usuario?.usuarioRol?.[0].estado,
        genero: usuario.persona.genero,
        nroDocumento: usuario.persona.nroDocumento,
        primerApellido: usuario.persona.primerApellido,
        segundoApellido: usuario.persona.segundoApellido,
        tipoDocumento: usuario.persona.tipoDocumento,
      })),
      total,
    ]
  }
}
