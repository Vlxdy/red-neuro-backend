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
  formatearUsuarioComoPersonal,
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
    return (
      usuarioSesion.rol === RolEnum.ADMINISTRADOR ||
      usuarioSesion.rol === RolEnum.JEFE ||
      usuarioSesion.roles?.includes(RolEnum.ADMINISTRADOR) === true ||
      usuarioSesion.roles?.includes(RolEnum.JEFE) === true
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

  private validarRolCreacion(
    rolDestino: RolEnum,
    usuarioSesion: UsuarioSesionPersonal
  ): RolEnumId {
    if (usuarioSesion.rol === RolEnum.ADMINISTRADOR) {
      return this.mapearRolEnumId(rolDestino)
    }

    if (usuarioSesion.rol === RolEnum.JEFE) {
      if (
        [
          RolEnum.COORDINADOR,
          RolEnum.PERSONAL,
          RolEnum.PROFESIONAL_INVITADO,
        ].includes(rolDestino)
      ) {
        return this.mapearRolEnumId(rolDestino)
      }

      throw new ForbiddenException(
        'No cuenta con permisos para crear usuarios con rol JEFE o ADMINISTRADOR.'
      )
    }

    throw new ForbiddenException(
      'No cuenta con permisos administrativos para gestionar personal de salud.'
    )
  }

  private mapearRolEnumId(rol: RolEnum): RolEnumId {
    switch (rol) {
      case RolEnum.ADMINISTRADOR:
        return RolEnumId.ADMINISTRADOR
      case RolEnum.JEFE:
        return RolEnumId.JEFE
      case RolEnum.COORDINADOR:
        return RolEnumId.COORDINADOR
      case RolEnum.PERSONAL:
        return RolEnumId.PERSONAL
      case RolEnum.PROFESIONAL_INVITADO:
        return RolEnumId.PROFESIONAL_INVITADO
      default:
        throw new ForbiddenException('Rol de creación no soportado.')
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

    const { ocupacion, rol, ...usuarioDto } = dto
    const idRolDestino = this.validarRolCreacion(rol, usuarioSesion)

    const resultado = await this.usuarioService.crear(
      {
        ...usuarioDto,
        roles: [idRolDestino],
      },
      usuarioAuditoria
    )

    const personalCreado =
      await this.personalSaludRepository.obtenerPersonalPorUsuarioIdYRoles(
        resultado.id,
        [rol]
      )

    if (!personalCreado) {
      throw new NotFoundException(Messages.PERSONAL_SALUD_NOT_FOUND)
    }

    if (ocupacion !== undefined) {
      await this.personalSaludRepository.actualizarOcupacionUsuario(
        personalCreado.idUsuario,
        ocupacion,
        usuarioAuditoria
      )
    }

    const personalActual =
      await this.personalSaludRepository.obtenerPersonalPorUsuarioIdYRoles(
        personalCreado.idUsuario,
        [rol]
      )

    if (!personalActual) {
      throw new NotFoundException(Messages.PERSONAL_SALUD_NOT_FOUND)
    }

    if (rol === RolEnum.ADMINISTRADOR) {
      return formatearUsuarioComoPersonal(personalActual.usuario)
    }

    return formatearPersonal(personalActual)
  }

  async actualizarPersonalSalud(
    id: string,
    dto: ActualizarPersonalSaludDto,
    usuarioAuditoria: string
  ): Promise<PersonalResponseDto> {
    const personal = await this.buscarPersonalSaludPorId(id)
    const { ocupacion, persona, correoElectronico } = dto

    const requiereActualizarDatos =
      persona !== undefined || correoElectronico !== undefined

    if (requiereActualizarDatos) {
      await this.usuarioService.actualizarDatos(
        personal.idUsuario,
        {
          persona,
          correoElectronico,
        },
        usuarioAuditoria
      )
    }

    if (ocupacion !== undefined) {
      await this.personalSaludRepository.actualizarOcupacionUsuario(
        personal.idUsuario,
        ocupacion ?? null,
        usuarioAuditoria
      )
    }

    const personalActualizado =
      await this.personalSaludRepository.obtenerPersonalSaludPorId({
        id: personal.idUsuario,
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
      personal.idUsuario,
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
      personal.idUsuario,
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
