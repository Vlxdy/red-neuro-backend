import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { RolEstado, UsuarioRolEstado } from '@/core/authorization/constant'
import { RolEnum } from '@/core/authorization/rol.enum'
import { Status } from '@/common/constants'

@Injectable()
export class PersonalSaludRepository {
  private readonly rolesOperativos = [
    RolEnum.JEFE,
    RolEnum.COORDINADOR,
    RolEnum.PERSONAL,
    RolEnum.PROFESIONAL_INVITADO,
  ]

  constructor(private readonly dataSource: DataSource) {}

  private usuarioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Usuario)
  }

  private crearQueryPersonal(manager?: EntityManager) {
    return this.usuarioRepository(manager)
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect(
        'usuario.usuarioRol',
        'usuarioRol',
        'usuarioRol.estado = :estadoUsuarioRol',
        {
          estadoUsuarioRol: UsuarioRolEstado.ACTIVE,
        }
      )
      .leftJoinAndSelect('usuarioRol.rol', 'rol', 'rol.estado = :rolEstado', {
        rolEstado: RolEstado.ACTIVE,
      })
      .where('rol.rol IN(:...roles)', { roles: this.rolesOperativos })
      .distinct(true)
  }

  async listarPersonalSaludPaginado(
    paginacionQuery: PaginacionQueryDto,
    incluirInactivos = false
  ) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.crearQueryPersonal().take(limite).skip(saltar)

    if (!incluirInactivos) {
      query.andWhere('usuario.estado = :estado', { estado: Status.ACTIVE })
    } else {
      query.andWhere('usuario.estado IN(:...estados)', {
        estados: [Status.ACTIVE, Status.INACTIVE],
      })
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('persona.nombres ILIKE :filtro', { filtro: `%${filtro}%` })
          qb.orWhere('persona.primerApellido ILIKE :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('persona.segundoApellido ILIKE :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('persona.nroDocumento ILIKE :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    switch (orden) {
      case 'nombres':
        query.addOrderBy('persona.nombres', sentido)
        break
      default:
        query.addOrderBy('usuario.id', 'ASC')
    }

    return await query.getManyAndCount()
  }

  async obtenerPersonalSaludPorId({
    id,
    estadoActivo = true,
    manager,
  }: {
    id: string
    estadoActivo?: boolean
    manager?: EntityManager
  }) {
    const query = this.crearQueryPersonal(manager).andWhere(
      'usuario.id = :id',
      {
        id,
      }
    )

    if (estadoActivo) {
      query.andWhere('usuario.estado = :estado', { estado: Status.ACTIVE })
    } else {
      query.andWhere('usuario.estado IN(:...estados)', {
        estados: [Status.ACTIVE, Status.INACTIVE],
      })
    }

    return await query.getOne()
  }

  async obtenerPersonalSaludPorUsuarioId(
    idUsuario: string,
    manager?: EntityManager
  ) {
    return await this.crearQueryPersonal(manager)
      .andWhere('usuario.id = :idUsuario', { idUsuario })
      .andWhere('usuario.estado = :estado', { estado: Status.ACTIVE })
      .getOne()
  }

  async obtenerPersonalPorUsuarioIdYRoles(
    idUsuario: string,
    roles: RolEnum[],
    manager?: EntityManager
  ) {
    return await this.crearQueryPersonal(manager)
      .andWhere('usuario.id = :idUsuario', { idUsuario })
      .andWhere('usuario.estado = :estado', {
        estado: Status.ACTIVE,
      })
      .andWhere('rol.rol IN(:...rolesFiltro)', { rolesFiltro: roles })
      .getOne()
  }

  async actualizarOcupacionUsuario(
    idUsuario: string,
    ocupacion: string | null,
    usuarioAuditoria: string,
    manager?: EntityManager
  ) {
    return await this.usuarioRepository(manager).update(idUsuario, {
      ocupacion: ocupacion ?? null,
      usuarioModificacion: usuarioAuditoria,
    })
  }

  async cambiarEstadoPersonalSalud(
    idUsuario: string,
    estado: Status,
    usuarioAuditoria: string,
    manager?: EntityManager
  ) {
    return await this.usuarioRepository(manager).update(idUsuario, {
      estado,
      usuarioModificacion: usuarioAuditoria,
    })
  }
}
