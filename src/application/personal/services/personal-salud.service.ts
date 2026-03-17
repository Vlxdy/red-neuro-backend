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

type UsuarioSesionPersonal = {
  rol?: string
  roles?: string[]
  esSupervisor?: boolean
}

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
    usuarioSesion: UsuarioSesionPersonal
  ): Promise<[PersonalResponseDto[], number]> {
    const incluirInactivos = paginacionQuery.incluirInactivos ?? false

    if (
      incluirInactivos &&
      !this.tienePermisosAdministradorPersonal(usuarioSesion)
    ) {
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

  private tienePermisosAdministradorPersonal(
    usuarioSesion: UsuarioSesionPersonal
  ): boolean {
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

  private validarPermisosAdministradorPersonal(
    usuarioSesion: UsuarioSesionPersonal
  ) {
    if (!this.tienePermisosAdministradorPersonal(usuarioSesion)) {
      throw new ForbiddenException(
        'No cuenta con permisos administrativos para gestionar personal de salud.'
      )
    }
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
    usuarioAuditoria: string,
    usuarioSesion: UsuarioSesionPersonal
  ): Promise<PersonalResponseDto> {
    this.validarPermisosAdministradorPersonal(usuarioSesion)

    const { ocupacion, ...usuarioDto } = dto

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

    if (ocupacion !== undefined) {
      await this.personalSaludRepository.actualizarOcupacion(
        personalCreado.id,
        ocupacion,
        usuarioAuditoria
      )
    }

    const personalActual =
      await this.personalSaludRepository.obtenerPersonalSaludPorId({
        id: personalCreado.id,
      })

    if (!personalActual) {
      throw new NotFoundException(Messages.PERSONAL_SALUD_NOT_FOUND)
    }

    return formatearPersonal(personalActual)
  }

  async actualizarPersonalSalud(
    id: string,
    dto: ActualizarPersonalSaludDto,
    usuarioAuditoria: string
  ): Promise<PersonalResponseDto> {
    const personal = await this.buscarPersonalSaludPorId(id)
    const { ocupacion, persona, correoElectronico, esSupervisor } = dto

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

    if (ocupacion !== undefined) {
      await this.personalSaludRepository.actualizarOcupacion(
        personal.id,
        ocupacion ?? null,
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

  async restablecerContrasenaPersonalSalud(
    id: string,
    usuarioAuditoria: string,
    usuarioSesion: UsuarioSesionPersonal
  ): Promise<{ id: string; estado: string }> {
    this.validarPermisosAdministradorPersonal(usuarioSesion)

    const personal = await this.buscarPersonalSaludPorId(id)
    return this.usuarioService.restaurarContrasena(
      personal.idUsuario,
      usuarioAuditoria
    )
  }
}
