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
  formatearUsuarioComoPersonal,
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
    this.validarPermisosListadoPersonal(usuarioSesion)

    const incluirInactivos =
      (paginacionQuery.incluirInactivos ?? false) &&
      this.tienePermisosAdministradorPersonal(usuarioSesion)

    const [personal, total] =
      await this.personalSaludRepository.listarPersonalSaludPaginado(
        paginacionQuery,
        incluirInactivos
      )

    return [formatearPersonales(personal), total]
  }

  private tieneAlgunRol(
    usuarioSesion: UsuarioSesionPersonal,
    roles: RolEnum[]
  ): boolean {
    return roles.some(
      (rol) =>
        usuarioSesion.rol === rol || usuarioSesion.roles?.includes(rol) === true
    )
  }

  private tienePermisosAdministradorPersonal(
    usuarioSesion: UsuarioSesionPersonal
  ): boolean {
    return this.tieneAlgunRol(usuarioSesion, [
      RolEnum.ADMINISTRADOR,
      RolEnum.JEFE,
    ])
  }

  private validarPermisosListadoPersonal(usuarioSesion: UsuarioSesionPersonal) {
    if (this.tieneAlgunRol(usuarioSesion, [RolEnum.PROFESIONAL_INVITADO])) {
      throw new ForbiddenException(
        'No cuenta con permisos para listar personal de salud.'
      )
    }
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

  async obtenerPersonalSaludPorId(
    id: string,
    usuarioSesion: UsuarioSesionPersonal
  ): Promise<PersonalResponseDto> {
    this.validarPermisosListadoPersonal(usuarioSesion)

    const personal = await this.buscarPersonalSaludPorId(id)
    return formatearUsuarioComoPersonal(personal)
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
        personalCreado.id,
        ocupacion,
        usuarioAuditoria
      )
    }

    const personalActual =
      await this.personalSaludRepository.obtenerPersonalPorUsuarioIdYRoles(
        personalCreado.id,
        [rol]
      )

    if (!personalActual) {
      throw new NotFoundException(Messages.PERSONAL_SALUD_NOT_FOUND)
    }

    return formatearUsuarioComoPersonal(personalActual)
  }

  async actualizarPersonalSalud(
    id: string,
    dto: ActualizarPersonalSaludDto,
    usuarioAuditoria: string,
    usuarioSesion: UsuarioSesionPersonal
  ): Promise<PersonalResponseDto> {
    this.validarPermisosAdministradorPersonal(usuarioSesion)

    const personal = await this.buscarPersonalSaludPorId(id)
    const { ocupacion, persona, correoElectronico } = dto

    const requiereActualizarDatos =
      persona !== undefined || correoElectronico !== undefined

    if (requiereActualizarDatos) {
      await this.usuarioService.actualizarDatos(
        personal.id,
        {
          persona,
          correoElectronico,
        },
        usuarioAuditoria
      )
    }

    if (ocupacion !== undefined) {
      await this.personalSaludRepository.actualizarOcupacionUsuario(
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

    return formatearUsuarioComoPersonal(personalActualizado)
  }

  async activarPersonalSalud(
    id: string,
    usuarioAuditoria: string,
    usuarioSesion: UsuarioSesionPersonal
  ): Promise<PersonalResponseDto> {
    this.validarPermisosAdministradorPersonal(usuarioSesion)

    const personal = await this.buscarPersonalSaludPorId(id, false)

    await this.personalSaludRepository.cambiarEstadoPersonalSalud(
      personal.id,
      Status.ACTIVE,
      usuarioAuditoria
    )

    personal.usuarioRol?.forEach((usuarioRol) => {
      usuarioRol.estado = Status.ACTIVE
    })

    return formatearUsuarioComoPersonal(personal)
  }

  async inactivarPersonalSalud(
    id: string,
    usuarioAuditoria: string,
    usuarioSesion: UsuarioSesionPersonal
  ): Promise<PersonalResponseDto> {
    this.validarPermisosAdministradorPersonal(usuarioSesion)

    const personal = await this.buscarPersonalSaludPorId(id)

    await this.personalSaludRepository.cambiarEstadoPersonalSalud(
      personal.id,
      Status.INACTIVE,
      usuarioAuditoria
    )

    personal.usuarioRol?.forEach((usuarioRol) => {
      usuarioRol.estado = Status.INACTIVE
    })

    return formatearUsuarioComoPersonal(personal)
  }

  async restablecerContrasenaPersonalSalud(
    id: string,
    usuarioAuditoria: string,
    usuarioSesion: UsuarioSesionPersonal
  ): Promise<{ id: string; estado: string }> {
    this.validarPermisosAdministradorPersonal(usuarioSesion)

    const personal = await this.buscarPersonalSaludPorId(id)
    return this.usuarioService.restaurarContrasena(
      personal.id,
      usuarioAuditoria
    )
  }
}
