import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { DataSource } from 'typeorm'
import { Status } from '../../../common/constants'
import { Injectable } from '@nestjs/common'
import { Rol } from '../entity/rol.entity'
import { CrearRolDto } from '../dto/crear-rol.dto'
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto'

@Injectable()
export class RolRepository {
  constructor(private dataSource: DataSource) {}

  async listar() {
    return await this.dataSource
      .getRepository(Rol)
      .createQueryBuilder('rol')
      .select(['rol.id', 'rol.rol', 'rol.nombre', 'rol.estado'])
      .where({ estado: Status.ACTIVE })
      .getMany()
  }

  async listarTodos(paginacionQueryDto: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQueryDto
    const query = await this.dataSource
      .getRepository(Rol)
      .createQueryBuilder('rol')
      .select(['rol.id', 'rol.rol', 'rol.nombre', 'rol.estado'])
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'rol':
        query.addOrderBy('rol.rol', sentido)
        break
      case 'nombre':
        query.addOrderBy('rol.nombre', sentido)
        break
      case 'estado':
        query.addOrderBy('rol.estado', sentido)
        break
      default:
        query.addOrderBy('rol.id', 'ASC')
    }

    if (filtro) {
      query.andWhere('(rol.nombre ilike :filtro or rol.rol ilike :filtro)', {
        filtro: `%${filtro}%`,
      })
    }
    return await query.getManyAndCount()
  }

  async buscarPorNombreRol(rol: string) {
    return await this.dataSource
      .getRepository(Rol)
      .createQueryBuilder('rol')
      .where({ rol: rol })
      .getOne()
  }

  async listarRolesPorUsuario(idUsuario: number) {
    return await this.dataSource
      .getRepository(Rol)
      .createQueryBuilder('rol')
      .select(['rol.id', 'rol.rol'])
      .where({ estado: Status.ACTIVE, usuarioRol: idUsuario })
      .getMany()
  }

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Rol)
      .createQueryBuilder('rol')
      .where({ id: id })
      .getOne()
  }

  async crear(rolDto: CrearRolDto, usuarioAuditoria: string) {
    const { nombre, rol } = rolDto

    const nuevoRol = new Rol()
    nuevoRol.nombre = nombre
    nuevoRol.rol = rol
    nuevoRol.usuarioCreacion = usuarioAuditoria

    return await this.dataSource.getRepository(Rol).save(nuevoRol)
  }

  async actualizar(id: string, rolDto: CrearRolDto, usuarioAuditoria: string) {
    const datosActualizar: QueryDeepPartialEntity<Rol> = new Rol({
      ...rolDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource.getRepository(Rol).update(id, datosActualizar)
  }
}
