import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { RolEnum } from '@/core/authorization/rol.enum'
import { Messages } from '@/common/constants/response-messages'

@Injectable()
export class MedicoPacienteService extends BaseService {
  constructor(
    @Inject(UsuarioRolRepository)
    private usuarioRolRepositorio: UsuarioRolRepository
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
}
