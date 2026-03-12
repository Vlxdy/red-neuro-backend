import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { RolEstado } from '@/core/authorization/constant'
import { RolEnum } from '@/core/authorization/rol.enum'
import { Status } from '@/common/constants'
import { UsuarioRolOcupacion } from '../entities/usuaro-rol-ocupacion.entity'

@Injectable()
export class PersonalSaludRepository {
  constructor(private readonly dataSource: DataSource) {}

  private usuarioRolRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(UsuarioRol)
  }

  private usuarioRolOcupacionRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(UsuarioRolOcupacion)
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
      .leftJoinAndSelect(
        'usuarioRol.usuarioRolOcupaciones',
        'usuarioRolOcupaciones'
      )
      .leftJoinAndSelect('usuarioRolOcupaciones.ocupacion', 'ocupacion')
      .select([
        'usuarioRol.id',
        'usuarioRol.idUsuario',
        'usuarioRol.idRol',
        'usuarioRol.estado',
        'usuarioRol.esSupervisor',
        'usuario.id',
        'usuario.correoElectronico',
        'usuario.urlFoto',
        'persona.nroDocumento',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'persona.fechaNacimiento',
        'persona.telefono',
        'persona.genero',
        'usuarioRolOcupaciones',
        'ocupacion.id',
        'ocupacion.nombre',
        'ocupacion.descripcion',
        'ocupacion.estado',
        'rol.id',
        'rol.rol',
      ])
      .where('rol.rol IN(:...roles)', {
        roles: [RolEnum.PERSONAL_SALUD],
      })
      .distinct(true)
      .take(limite)
      .skip(saltar)

    if (!incluirInactivos) {
      query.andWhere('usuarioRol.estado = :estado', {
        estado: Status.ACTIVE,
      })
    } else {
      query.andWhere('usuarioRol.estado IN(:...estados)', {
        estados: [Status.ACTIVE, Status.INACTIVE],
      })
    }

    if (filtro) {
      const filtroNormalizado = filtro.trim()
      const nombreCompleto = `
    unaccent(lower(concat_ws(' ', persona.nombres, persona.primerApellido, persona.segundoApellido)))
  `
      const filtroExpr = `unaccent(lower(:filtro))`

      query.addSelect(`similarity(${nombreCompleto}, ${filtroExpr})`, 'score')
      query.addSelect(
        `(CASE WHEN persona.nroDocumento ILIKE :filtroExacto THEN 1 ELSE 0 END)`,
        'match_doc'
      )
      query.addSelect(
        `(CASE WHEN persona.telefono ILIKE :filtroExacto THEN 1 ELSE 0 END)`,
        'match_tel'
      )

      query.setParameters({
        filtro: filtroNormalizado,
        filtroExacto: `%${filtroNormalizado}%`,
      })

      query.orderBy('match_doc', 'DESC')
      query.addOrderBy('match_tel', 'DESC')
      query.addOrderBy('score', 'DESC')
    } else {
      switch (orden) {
        case 'nombres':
          query.addOrderBy('persona.nombres', sentido)
          break
        case 'primerApellido':
          query.addOrderBy('persona.primerApellido', sentido)
          break
        case 'segundoApellido':
          query.addOrderBy('persona.segundoApellido', sentido)
          break
        case 'nroDocumento':
          query.addOrderBy('persona.nroDocumento', sentido)
          break
        case 'telefono':
          query.addOrderBy('persona.telefono', sentido)
          break
        default:
          query.addOrderBy('usuarioRol.id', 'ASC')
      }
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
      .leftJoinAndSelect(
        'usuarioRol.usuarioRolOcupaciones',
        'usuarioRolOcupaciones'
      )
      .leftJoinAndSelect('usuarioRolOcupaciones.ocupacion', 'ocupacion')
      .select([
        'usuarioRol.id',
        'usuarioRol.idUsuario',
        'usuarioRol.idRol',
        'usuarioRol.estado',
        'usuarioRol.esSupervisor',
        'usuario.id',
        'usuario.correoElectronico',
        'usuario.urlFoto',
        'persona.nroDocumento',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'persona.fechaNacimiento',
        'persona.telefono',
        'persona.genero',
        'usuarioRolOcupaciones',
        'ocupacion.id',
        'ocupacion.nombre',
        'ocupacion.descripcion',
        'ocupacion.estado',
        'rol.id',
        'rol.rol',
      ])
      .where('usuarioRol.id = :id', { id })
      .andWhere('rol.rol = :rol', { rol: RolEnum.PERSONAL_SALUD })

    if (estadoActivo) {
      query.andWhere('usuarioRol.estado = :estado', {
        estado: Status.ACTIVE,
      })
    }

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
      .leftJoinAndSelect(
        'usuarioRol.usuarioRolOcupaciones',
        'usuarioRolOcupaciones'
      )
      .leftJoinAndSelect('usuarioRolOcupaciones.ocupacion', 'ocupacion')
      .select([
        'usuarioRol.id',
        'usuarioRol.idUsuario',
        'usuarioRol.idRol',
        'usuarioRol.estado',
        'usuarioRol.esSupervisor',
        'usuario.id',
        'usuario.correoElectronico',
        'usuario.urlFoto',
        'persona.nroDocumento',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'persona.fechaNacimiento',
        'persona.telefono',
        'persona.genero',
        'usuarioRolOcupaciones',
        'ocupacion.id',
        'ocupacion.nombre',
        'ocupacion.descripcion',
        'ocupacion.estado',
        'rol.id',
        'rol.rol',
      ])
      .where('usuarioRol.idUsuario = :idUsuario', { idUsuario })
      .andWhere('usuarioRol.estado = :estado', {
        estado: Status.ACTIVE,
      })
      .andWhere('rol.rol = :rol', { rol: RolEnum.PERSONAL_SALUD })
      .getOne()
  }

  async actualizarEsSupervisor(
    idUsuarioRol: string,
    esSupervisor: boolean,
    usuarioAuditoria: string,
    manager?: EntityManager
  ) {
    return await this.usuarioRolRepository(manager).update(idUsuarioRol, {
      esSupervisor,
      usuarioModificacion: usuarioAuditoria,
    })
  }

  async cambiarEstadoPersonalSalud(
    idUsuarioRol: string,
    estado: Status,
    usuarioAuditoria: string,
    manager?: EntityManager
  ) {
    return await this.usuarioRolRepository(manager).update(idUsuarioRol, {
      estado,
      usuarioModificacion: usuarioAuditoria,
    })
  }

  async crearUsuarioRolOcupaciones(
    idUsuarioRol: string,
    idOcupaciones: string[],
    usuarioAuditoria: string,
    manager?: EntityManager
  ) {
    const repo = this.usuarioRolOcupacionRepository(manager)
    const ocupacionesUnicas = Array.from(new Set(idOcupaciones))

    const registros = ocupacionesUnicas.map((idOcupacion) =>
      repo.create({
        idUsuarioRol,
        idOcupacion,
        usuarioCreacion: usuarioAuditoria,
      })
    )

    return await repo.save(registros)
  }

  async eliminarUsuarioRolOcupaciones(
    idUsuarioRol: string,
    manager?: EntityManager
  ) {
    return await this.usuarioRolOcupacionRepository(manager).delete({
      idUsuarioRol,
    })
  }

  async reemplazarOcupaciones(
    idUsuarioRol: string,
    idOcupaciones: string[],
    usuarioAuditoria: string,
    manager?: EntityManager
  ) {
    const repo = manager ?? this.dataSource
    return await repo.transaction(async (transaction) => {
      await this.eliminarUsuarioRolOcupaciones(idUsuarioRol, transaction)

      if (idOcupaciones.length === 0) {
        return []
      }

      return await this.crearUsuarioRolOcupaciones(
        idUsuarioRol,
        idOcupaciones,
        usuarioAuditoria,
        transaction
      )
    })
  }
}
