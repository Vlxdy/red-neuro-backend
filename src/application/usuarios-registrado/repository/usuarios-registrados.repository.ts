import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { RolEnum } from '@/core/authorization/rol.enum'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { RolEstado, UsuarioRolEstado } from '@/core/authorization/constant'

@Injectable()
export class UsuariosRegistradosRepository {
  constructor(private dataSource: DataSource) {}

  async listarUsuariosPorRol(params: PaginacionQueryDto, rol: RolEnum) {
    const { limite, saltar, filtro, orden, sentido } = params

    const query = this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .leftJoinAndSelect(
        'usuario.usuarioRol',
        'usuarioRol',
        'usuarioRol.estado = :estado',
        { estado: UsuarioRolEstado.ACTIVE }
      )
      .leftJoinAndSelect('usuarioRol.rol', 'rol', 'rol.estado = :estado', {
        estado: RolEstado.ACTIVE,
      })
      .leftJoinAndSelect('usuario.persona', 'persona')
      .select([
        'usuario.id',
        'usuario.usuario',
        'usuario.correoElectronico',
        'usuario.estado',
        'usuario.ciudadaniaDigital',
        'usuario.fechaCreacion',
        'usuarioRol',
        'rol.id',
        'rol.rol',
        'rol.nombre',
        'persona.nroDocumento',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'persona.fechaNacimiento',
        'persona.tipoDocumento',
        'persona.telefono',
      ])
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

  async listarPacientesPorMedico(idMedico: string, params: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = params

    const query = this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .leftJoinAndSelect(
        'usuario.usuarioRol',
        'usuarioRol',
        'usuarioRol.estado = :estado',
        { estado: UsuarioRolEstado.ACTIVE }
      )
      .innerJoinAndSelect(
        'usuarioRol.controlPacientes',
        'controlPacientes',
        'controlPacientes.estado = :estado',
        {
          estado: RolEstado.ACTIVE,
        }
      )
      .leftJoinAndSelect('usuarioRol.rol', 'rol', 'rol.estado = :estado', {
        estado: RolEstado.ACTIVE,
      })
      .leftJoinAndSelect('usuario.persona', 'persona')
      .select([
        'usuario.id',
        'usuario.usuario',
        'usuario.correoElectronico',
        'usuario.estado',
        'usuario.ciudadaniaDigital',
        'usuario.fechaCreacion',
        'usuarioRol',
        'rol.id',
        'rol.rol',
        'rol.nombre',
        'persona.nroDocumento',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'persona.fechaNacimiento',
        'persona.tipoDocumento',
        'persona.telefono',
      ])
      .take(limite)
      .skip(saltar)
      .where('controlPacientes.idMedico = :idMedico', { idMedico })

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

    // query.andWhere('rol.rol = :rol', {
    //   rol,
    // })

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
  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
