import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { RolEstado } from '@/core/authorization/constant'
import { RolEnum } from '@/core/authorization/rol.enum'
import { Status } from '@/common/constants'

@Injectable()
export class PersonalSaludRepository {
  constructor(private readonly dataSource: DataSource) {}

  private usuarioRolRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(UsuarioRol)
  }

  private usuarioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Usuario)
  }

  async listarPersonalSaludPaginado(
    paginacionQuery: PaginacionQueryDto,
    incluirInactivos = false
  ) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.usuarioRolRepository()
      .createQueryBuilder('usuarioRol')
      .leftJoinAndSelect('usuarioRol.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuarioRol.rol', 'rol', 'rol.estado = :rolEstado', {
        rolEstado: RolEstado.ACTIVE,
      })
      .where('rol.rol IN(:...roles)', { roles: [RolEnum.PERSONAL_SALUD] })
      .distinct(true)
      .take(limite)
      .skip(saltar)

    if (!incluirInactivos) {
      query.andWhere('usuarioRol.estado = :estado', { estado: Status.ACTIVE })
    } else {
      query.andWhere('usuarioRol.estado IN(:...estados)', {
        estados: [Status.ACTIVE, Status.INACTIVE],
      })
    }

    if (filtro) {
      query.andWhere(
        '(persona.nombres ILIKE :filtro OR persona.primerApellido ILIKE :filtro)',
        { filtro: `%${filtro}%` }
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
    const query = this.usuarioRolRepository(manager)
      .createQueryBuilder('usuarioRol')
      .leftJoinAndSelect('usuarioRol.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuarioRol.rol', 'rol', 'rol.estado = :rolEstado', {
        rolEstado: RolEstado.ACTIVE,
      })
      .where('usuario.id = :id', { id })
      .andWhere('rol.rol = :rol', { rol: RolEnum.PERSONAL_SALUD })

    if (estadoActivo)
      query.andWhere('usuarioRol.estado = :estado', { estado: Status.ACTIVE })
    return await query.getOne()
  }

  async obtenerPersonalSaludPorUsuarioId(
    idUsuario: string,
    manager?: EntityManager
  ) {
    return await this.usuarioRolRepository(manager)
      .createQueryBuilder('usuarioRol')
      .leftJoinAndSelect('usuarioRol.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuarioRol.rol', 'rol', 'rol.estado = :rolEstado', {
        rolEstado: RolEstado.ACTIVE,
      })
      .where('usuarioRol.idUsuario = :idUsuario', { idUsuario })
      .andWhere('usuarioRol.estado = :estado', { estado: Status.ACTIVE })
      .andWhere('rol.rol = :rol', { rol: RolEnum.PERSONAL_SALUD })
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
    return await this.usuarioRolRepository(manager).update(
      { idUsuario },
      {
        estado,
        usuarioModificacion: usuarioAuditoria,
      }
    )
  }
}
