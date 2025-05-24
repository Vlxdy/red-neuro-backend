import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { RolEnum } from '@/core/authorization/rol.enum'
import { Messages } from '@/common/constants/response-messages'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { UsuariosRegistradosRepository } from '../repositories/usuarios-registrados.repository'

import {
  PacientesAsignadosDto,
  UsuariosRegistradosResponse,
} from '../dto/usuarios-registrados.dto'
import { formatearUsuariosRolesRespuesta } from '../utils/formateos'

@Injectable()
export class PacientesService extends BaseService {
  constructor(
    @Inject(UsuarioRolRepository)
    private usuarioRolRepositorio: UsuarioRolRepository,
    private usuarioRegistradoRepositorio: UsuariosRegistradosRepository
  ) {
    super()
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

  async listarPacientePorMedico(
    params: PacientesAsignadosDto,
    idMedico: string
  ): Promise<[UsuariosRegistradosResponse[], number]> {
    const { todos } = params
    const [usuariosRol, total] =
      await this.usuarioRegistradoRepositorio.listarPacientesPorMedico(
        idMedico,
        params,
        todos
      )
    return [formatearUsuariosRolesRespuesta(usuariosRol), total]
  }

  async listarPacientesPorAsignar({
    idMedico,
    params,
  }: {
    params: PaginacionQueryDto
    idMedico: string
  }): Promise<[UsuariosRegistradosResponse[], number]> {
    const [uduarios, total] =
      await this.usuarioRegistradoRepositorio.listarPacientesPorAsignar({
        idPacientesOmitir: [idMedico],
        params,
      })

    return [formatearUsuariosRolesRespuesta(uduarios), total]
  }
}
