import { UsuarioRol } from '../entity/usuario-rol.entity'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Rol } from '../entity/rol.entity'
import { Injectable } from '@nestjs/common'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { RolEstado, UsuarioRolEstado } from '@/core/authorization/constant'
import { PersonaEstado, UsuarioEstado } from '@/core/usuario/constant'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { RolEnum } from '../rol.enum'

@Injectable()
export class UsuarioRolRepository {
  constructor(private dataSource: DataSource) {}

  async obtenerRolesPorUsuario(idUsuario: string, transaction?: EntityManager) {
    return await (
      transaction?.getRepository(UsuarioRol) ??
      this.dataSource.getRepository(UsuarioRol)
    )
      .createQueryBuilder('usuarioRol')
      .leftJoinAndSelect('usuarioRol.rol', 'rol')
      .where('usuarioRol.id_usuario = :idUsuario', { idUsuario })
      .getMany()
  }

  async buscarPorId(id: string, transaction?: EntityManager) {
    return await (
      transaction?.getRepository(UsuarioRol) ??
      this.dataSource.getRepository(UsuarioRol)
    )
      .createQueryBuilder('usuarioRol')
      .where('usuarioRol.id = :id', { id })
      .innerJoinAndSelect('usuarioRol.rol', 'rol', 'rol.estado = :estado', {
        estado: UsuarioRolEstado.ACTIVE,
      })
      .innerJoinAndSelect(
        'usuarioRol.usuario',
        'usuario',
        'usuario.estado = :estado',
        {
          estado: UsuarioEstado.ACTIVE,
        }
      )
      .innerJoinAndSelect('usuario.persona', 'persona')
      .getOne()
  }

  async activar(
    idUsuario: string,
    roles: Array<string>,
    usuarioAuditoria: string,
    transaction?: EntityManager
  ) {
    return await (
      transaction?.getRepository(UsuarioRol) ??
      this.dataSource.getRepository(UsuarioRol)
    )
      .createQueryBuilder()
      .update(UsuarioRol)
      .set({
        estado: UsuarioRolEstado.ACTIVE,
        usuarioModificacion: usuarioAuditoria,
      })
      .where('id_usuario = :idUsuario', { idUsuario })
      .andWhere('id_rol IN(:...ids)', { ids: roles })
      .execute()
  }

  async inactivar(
    idUsuario: string,
    roles: Array<string>,
    usuarioAuditoria: string,
    transaction?: EntityManager
  ) {
    return await (
      transaction?.getRepository(UsuarioRol) ??
      this.dataSource.getRepository(UsuarioRol)
    )
      .createQueryBuilder()
      .update(UsuarioRol)
      .set({
        estado: UsuarioRolEstado.INACTIVE,
        usuarioModificacion: usuarioAuditoria,
      })
      .where('id_usuario = :idUsuario', { idUsuario })
      .andWhere('id_rol IN(:...ids)', { ids: roles })
      .execute()
  }

  async cambiarEstadoPorRoles(
    roles: Array<string>,
    estado: string,
    usuarioAuditoria: string,
    transaction?: EntityManager
  ) {
    return await (
      transaction?.getRepository(UsuarioRol) ??
      this.dataSource.getRepository(UsuarioRol)
    )
      .createQueryBuilder()
      .update(UsuarioRol)
      .set({
        estado: estado,
        usuarioModificacion: usuarioAuditoria,
      })
      .andWhere('id_rol IN(:...ids)', { ids: roles })
      .execute()
  }

  async crear(
    idUsuario: string,
    roles: Array<string>,
    usuarioAuditoria: string,
    transaction?: EntityManager
  ) {
    const usuarioRoles = roles.map((idRol) => {
      const usuario = new Usuario()
      usuario.id = idUsuario

      const rol = new Rol()
      rol.id = idRol

      const usuarioRol = new UsuarioRol()
      usuarioRol.usuario = usuario
      usuarioRol.rol = rol
      usuarioRol.usuarioCreacion = usuarioAuditoria

      return usuarioRol
    })

    return await (
      transaction?.getRepository(UsuarioRol) ??
      this.dataSource.getRepository(UsuarioRol)
    ).save(usuarioRoles)
  }

  async actualizarEsSupervisorPorUsuarioRol(
    idUsuario: string,
    idRol: string,
    esSupervisor: boolean,
    usuarioAuditoria: string,
    transaction?: EntityManager
  ) {
    return await (
      transaction?.getRepository(UsuarioRol) ??
      this.dataSource.getRepository(UsuarioRol)
    )
      .createQueryBuilder()
      .update(UsuarioRol)
      .set({
        esSupervisor,
        usuarioModificacion: usuarioAuditoria,
      })
      .where('id_usuario = :idUsuario', { idUsuario })
      .andWhere('id_rol = :idRol', { idRol })
      .execute()
  }

  async listarUsuariosPorRol(params: PaginacionQueryDto, rol: RolEnum) {
    const { limite, saltar, filtro, orden, sentido } = params

    const query = this.dataSource
      .getRepository(UsuarioRol)
      .createQueryBuilder('usuarioRol')
      .innerJoinAndSelect(
        'usuarioRol.usuario',
        'usuario',
        'usuario.estado = :estado',
        { estado: UsuarioEstado.ACTIVE }
      )
      .innerJoinAndSelect(
        'usuario.persona',
        'persona',
        'persona.estado = :estadoPersona',
        {
          estadoPersona: PersonaEstado.ACTIVE,
        }
      )
      .innerJoinAndSelect('usuarioRol.rol', 'rol', 'rol.estado = :estado', {
        estado: RolEstado.ACTIVE,
      })
      .select(['usuario', 'usuarioRol', 'rol', 'persona'])
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nroDocumento':
        query.addOrderBy('persona.nroDocumento', sentido)
        break
      case 'nombres':
        query.addOrderBy('persona.nombres', sentido)
        break
      case 'usuario':
        query.addOrderBy('usuario.usuario', sentido)
        break
      case 'rol':
        query.addOrderBy('rol.rol', sentido)
        break
      case 'estado':
        query.addOrderBy('usuario.estado', sentido)
        break
      default:
        query.addOrderBy('usuario.id', 'ASC')
    }

    query.andWhere('rol.rol = :rol', {
      rol,
    })

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('usuario.usuario ilike :filtro', { filtro: `%${filtro}%` })
          qb.orWhere('persona.nroDocumento ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('persona.nombres ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('persona.primerApellido ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('persona.segundoApellido ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }
    return await query.getManyAndCount()
  }
}
