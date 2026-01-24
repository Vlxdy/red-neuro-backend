import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { RolEstado, UsuarioRolEstado } from '@/core/authorization/constant'
import { RolEnum } from '@/core/authorization/rol.enum'
import { UsuarioRolEspecialidad } from '../entities/usuaro-rol-especialidad.entity'

@Injectable()
export class PersonalSaludRepository {
  constructor(private readonly dataSource: DataSource) {}

  private usuarioRolRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(UsuarioRol)
  }

  private usuarioRolEspecialidadRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(UsuarioRolEspecialidad)
  }

  async listarPersonalSaludPaginado(paginacionQuery: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.usuarioRolRepository()
      .createQueryBuilder('usuarioRol')
      .leftJoinAndSelect('usuarioRol.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuarioRol.rol', 'rol', 'rol.estado = :rolEstado', {
        rolEstado: RolEstado.ACTIVE,
      })
      .leftJoinAndSelect(
        'usuarioRol.usuarioRolEspecialidades',
        'usuarioRolEspecialidades'
      )
      .leftJoinAndSelect(
        'usuarioRolEspecialidades.especialidad',
        'especialidad'
      )
      .select([
        'usuarioRol.id',
        'usuarioRol.idUsuario',
        'usuarioRol.idRol',
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
        'usuarioRolEspecialidades',
        'especialidad.id',
        'especialidad.nombre',
        'especialidad.descripcion',
        'especialidad.estado',
        'especialidad.colorHex',
        'rol.id',
        'rol.rol',
      ])
      .where('usuarioRol.estado = :estado', {
        estado: UsuarioRolEstado.ACTIVE,
      })
      .andWhere('rol.rol IN(:...roles)', {
        roles: [RolEnum.PERSONAL_SALUD],
      })
      .distinct(true)
      .take(limite)
      .skip(saltar)

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

  async obtenerPersonalSaludPorId(id: string, manager?: EntityManager) {
    return await this.usuarioRolRepository(manager)
      .createQueryBuilder('usuarioRol')
      .leftJoinAndSelect('usuarioRol.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuarioRol.rol', 'rol', 'rol.estado = :rolEstado', {
        rolEstado: RolEstado.ACTIVE,
      })
      .leftJoinAndSelect(
        'usuarioRol.usuarioRolEspecialidades',
        'usuarioRolEspecialidades'
      )
      .leftJoinAndSelect(
        'usuarioRolEspecialidades.especialidad',
        'especialidad'
      )
      .select([
        'usuarioRol.id',
        'usuarioRol.idUsuario',
        'usuarioRol.idRol',
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
        'usuarioRolEspecialidades',
        'especialidad.id',
        'especialidad.nombre',
        'especialidad.descripcion',
        'especialidad.estado',
        'especialidad.colorHex',
        'rol.id',
        'rol.rol',
      ])
      .where('usuarioRol.id = :id', { id })
      .andWhere('usuarioRol.estado = :estado', {
        estado: UsuarioRolEstado.ACTIVE,
      })
      .andWhere('rol.rol = :rol', { rol: RolEnum.PERSONAL_SALUD })
      .getOne()
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
        'usuarioRol.usuarioRolEspecialidades',
        'usuarioRolEspecialidades'
      )
      .leftJoinAndSelect(
        'usuarioRolEspecialidades.especialidad',
        'especialidad'
      )
      .select([
        'usuarioRol.id',
        'usuarioRol.idUsuario',
        'usuarioRol.idRol',
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
        'usuarioRolEspecialidades',
        'especialidad.id',
        'especialidad.nombre',
        'especialidad.descripcion',
        'especialidad.estado',
        'especialidad.colorHex',
        'rol.id',
        'rol.rol',
      ])
      .where('usuarioRol.idUsuario = :idUsuario', { idUsuario })
      .andWhere('usuarioRol.estado = :estado', {
        estado: UsuarioRolEstado.ACTIVE,
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
    estado: UsuarioRolEstado,
    usuarioAuditoria: string,
    manager?: EntityManager
  ) {
    return await this.usuarioRolRepository(manager).update(idUsuarioRol, {
      estado,
      usuarioModificacion: usuarioAuditoria,
    })
  }

  async crearUsuarioRolEspecialidades(
    idUsuarioRol: string,
    especialidades: string[],
    usuarioAuditoria: string,
    manager?: EntityManager
  ) {
    const repo = this.usuarioRolEspecialidadRepository(manager)
    const especialidadesUnicas = Array.from(new Set(especialidades))

    const registros = especialidadesUnicas.map((idEspecialidad) =>
      repo.create({
        idUsuarioRol,
        idEspecialidad,
        usuarioCreacion: usuarioAuditoria,
      })
    )

    return await repo.save(registros)
  }

  async eliminarUsuarioRolEspecialidades(
    idUsuarioRol: string,
    manager?: EntityManager
  ) {
    return await this.usuarioRolEspecialidadRepository(manager).delete({
      idUsuarioRol,
    })
  }

  async reemplazarEspecialidades(
    idUsuarioRol: string,
    especialidades: string[],
    usuarioAuditoria: string,
    manager?: EntityManager
  ) {
    const repo = manager ?? this.dataSource
    return await repo.transaction(async (transaction) => {
      await this.eliminarUsuarioRolEspecialidades(idUsuarioRol, transaction)

      if (especialidades.length === 0) {
        return []
      }

      return await this.crearUsuarioRolEspecialidades(
        idUsuarioRol,
        especialidades,
        usuarioAuditoria,
        transaction
      )
    })
  }
}
