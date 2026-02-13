import { BaseService } from '@/common/base'
import { Messages } from '@/common/constants/response-messages'
import {
  ForbiddenException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common'
import { UsuarioService } from '@/core/usuario/service/usuario.service'
import { RolEnum, RolEnumId } from '@/core/authorization/rol.enum'
import {
  formatearPersonal,
  formatearPersonales,
} from '../utils/formateo-personal.utils'
import { PersonalResponseDto } from '../dto/personal.dto'
import { ListarPersonalSaludQueryDto } from '../dto/listar-personal-salud-query.dto'
import {
  ActualizarPersonalSaludDto,
  CrearPersonalSaludDto,
} from '../dto/personal-salud.dto'
import { PersonalSaludRepository } from '../repository/personal-salud.repository'
import { Status } from '@/common/constants'

@Injectable()
export class PersonalSaludService extends BaseService {
  constructor(
    @Inject(PersonalSaludRepository)
    private readonly personalSaludRepository: PersonalSaludRepository,
    private readonly usuarioService: UsuarioService
  ) {
    super()
  }

  async listarPersonalSalud(
    paginacionQuery: ListarPersonalSaludQueryDto,
    usuarioSesion: {
      rol?: string
      roles?: string[]
      esSupervisor?: boolean
    }
  ): Promise<[PersonalResponseDto[], number]> {
    const incluirInactivos = paginacionQuery.incluirInactivos ?? false

    if (incluirInactivos && !this.puedeListarInactivos(usuarioSesion)) {
      throw new ForbiddenException(
        'No cuenta con permisos para listar personal de salud inactivo.'
      )
    }

    const [personal, total] =
      await this.personalSaludRepository.listarPersonalSaludPaginado(
        paginacionQuery,
        incluirInactivos
      )

    return [formatearPersonales(personal), total]
  }

  private puedeListarInactivos(usuarioSesion: {
    rol?: string
    roles?: string[]
    esSupervisor?: boolean
  }): boolean {
    if (usuarioSesion.rol === RolEnum.ADMINISTRADOR) {
      return true
    }

    if (usuarioSesion.roles?.includes(RolEnum.ADMINISTRADOR)) {
      return true
    }

    return (
      usuarioSesion.rol === RolEnum.PERSONAL_SALUD &&
      usuarioSesion.esSupervisor === true
    )
  }

  private async buscarPersonalSaludPorId(id: string, estadoActivo = true) {
    const personal =
      await this.personalSaludRepository.obtenerPersonalSaludPorId({
        id,
        estadoActivo,
      })

    if (!personal) {
      throw new NotFoundException(Messages.PERSONAL_SALUD_NOT_FOUND)
    }

    return personal
  }

  async obtenerPersonalSaludPorId(id: string): Promise<PersonalResponseDto> {
    const personal = await this.buscarPersonalSaludPorId(id)
    return formatearPersonal(personal)
  }

  async crearPersonalSalud(
    dto: CrearPersonalSaludDto,
    usuarioAuditoria: string
  ): Promise<PersonalResponseDto> {
    const { idEspecialidades, ...usuarioDto } = dto

    const resultado = await this.usuarioService.crear(
      {
        ...usuarioDto,
        roles: [RolEnumId.PERSONAL_SALUD],
      },
      usuarioAuditoria
    )

    const personalCreado =
      await this.personalSaludRepository.obtenerPersonalSaludPorUsuarioId(
        resultado.id
      )

    if (!personalCreado) {
      throw new NotFoundException(Messages.PERSONAL_SALUD_NOT_FOUND)
    }

    if (idEspecialidades && idEspecialidades.length > 0) {
      await this.personalSaludRepository.crearUsuarioRolEspecialidades(
        personalCreado.id,
        idEspecialidades,
        usuarioAuditoria
      )
    }

    const personalConEspecialidades =
      await this.personalSaludRepository.obtenerPersonalSaludPorId({
        id: personalCreado.id,
      })

    if (!personalConEspecialidades) {
      throw new NotFoundException(Messages.PERSONAL_SALUD_NOT_FOUND)
    }

    return formatearPersonal(personalConEspecialidades)
  }

  async actualizarPersonalSalud(
    id: string,
    dto: ActualizarPersonalSaludDto,
    usuarioAuditoria: string
  ): Promise<PersonalResponseDto> {
    const personal = await this.buscarPersonalSaludPorId(id)
    const { idEspecialidades, persona, correoElectronico, esSupervisor } = dto

    const requiereActualizarDatos =
      persona !== undefined ||
      correoElectronico !== undefined ||
      esSupervisor !== undefined

    if (requiereActualizarDatos) {
      await this.usuarioService.actualizarDatos(
        personal.idUsuario,
        {
          persona,
          correoElectronico,
          esSupervisor,
        },
        usuarioAuditoria
      )
    }

    if (idEspecialidades !== undefined) {
      await this.personalSaludRepository.reemplazarEspecialidades(
        personal.id,
        idEspecialidades,
        usuarioAuditoria
      )
    }

    const personalActualizado =
      await this.personalSaludRepository.obtenerPersonalSaludPorId({
        id: personal.id,
      })

    if (!personalActualizado) {
      throw new NotFoundException(Messages.PERSONAL_SALUD_NOT_FOUND)
    }

    return formatearPersonal(personalActualizado)
  }

  async activarPersonalSalud(
    id: string,
    usuarioAuditoria: string
  ): Promise<PersonalResponseDto> {
    const personal = await this.buscarPersonalSaludPorId(id, false)

    await this.personalSaludRepository.cambiarEstadoPersonalSalud(
      personal.id,
      Status.ACTIVE,
      usuarioAuditoria
    )

    personal.estado = Status.ACTIVE

    return formatearPersonal(personal)
  }

  async inactivarPersonalSalud(
    id: string,
    usuarioAuditoria: string
  ): Promise<PersonalResponseDto> {
    const personal = await this.buscarPersonalSaludPorId(id)

    await this.personalSaludRepository.cambiarEstadoPersonalSalud(
      personal.id,
      Status.INACTIVE,
      usuarioAuditoria
    )

    personal.estado = Status.INACTIVE

    return formatearPersonal(personal)
  }
}
