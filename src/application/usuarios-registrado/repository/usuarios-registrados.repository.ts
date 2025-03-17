import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { RolEnum } from '@/core/authorization/rol.enum'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { RolEstado, UsuarioRolEstado } from '@/core/authorization/constant'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { UsuarioEstado } from '@/core/usuario/constant'

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

  async listarPacientesPorMedico(
    idMedico: string,
    params: PaginacionQueryDto,
    todo?: boolean
  ) {
    const { limite, saltar, filtro, orden, sentido } = params

    const query = this.dataSource
      .getRepository(UsuarioRol)
      .createQueryBuilder('usuarioRol')
      // .leftJoinAndSelect(
      //   'usuario.usuarioRol',
      //   'usuarioRol',
      //   'usuarioRol.estado = :estado',
      //   { estado: UsuarioRolEstado.ACTIVE }
      // )
      .innerJoinAndSelect(
        'usuarioRol.usuario',
        'usuario',
        'usuario.estado = :estado',
        {
          estado: UsuarioEstado.ACTIVE,
        }
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
      .where('controlPacientes.idMedico = :idMedico', { idMedico })
      .andWhere('usuarioRol.estado = :estado', {
        estado: UsuarioRolEstado.ACTIVE,
      })
    if (todo) {
      query.take(limite).skip(saltar)
    }

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
  async listarPacientesPorAsignar({
    params,
    idPacientesOmitir,
  }: {
    params: PaginacionQueryDto
    idPacientesOmitir?: string[]
  }): Promise<[any[], number]> {
    const { limite, saltar, filtro, orden, sentido } = params

    // Query base para reutilizar
    const baseQuery = this.dataSource
      .getRepository(UsuarioRol)
      .createQueryBuilder('usuarioRol')
      .innerJoin(
        'usuarioRol.usuario',
        'usuario',
        'usuario.estado = :estadoUsuario',
        {
          estadoUsuario: UsuarioEstado.ACTIVE,
        }
      )
      .innerJoin(
        'usuarioRol.rol',
        'rol',
        '(rol.estado = :estadoRol and rol.rol = :rol)',
        {
          estadoRol: RolEstado.ACTIVE,
          rol: RolEnum.PACIENTE,
        }
      )
      .leftJoin('usuario.persona', 'persona')
      .where('usuarioRol.estado = :estadoUsuarioRol', {
        estadoUsuarioRol: UsuarioRolEstado.ACTIVE,
      })

    // Aplicar omitir IDs si corresponde
    if (idPacientesOmitir && idPacientesOmitir.length > 0) {
      baseQuery.andWhere('usuarioRol.id NOT IN (:...idPacientesOmitir)', {
        idPacientesOmitir,
      })
    }

    // Filtros de búsqueda
    if (filtro) {
      baseQuery.andWhere(
        new Brackets((qb) => {
          qb.orWhere('usuario.usuario ilike :filtro', { filtro: `%${filtro}%` })
            .orWhere('persona.nroDocumento ilike :filtro', {
              filtro: `%${filtro}%`,
            })
            .orWhere('persona.nombres ilike :filtro', { filtro: `%${filtro}%` })
            .orWhere('persona.primerApellido ilike :filtro', {
              filtro: `%${filtro}%`,
            })
            .orWhere('persona.segundoApellido ilike :filtro', {
              filtro: `%${filtro}%`,
            })
        })
      )
    }

    // -------- 1. Obtener total sin paginación --------
    const total = await baseQuery.getCount()

    // -------- 2. Obtener datos paginados --------
    const datosQuery = baseQuery
      .clone() // <- CLONAMOS la base para evitar conflictos
      // .leftJoinAndSelect('usuarioRol.rol', 'rol')
      // .leftJoinAndSelect('usuario.persona', 'persona')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(control.id_paciente)', 'totalConsultasPaciente')
          .from(`${process.env.DB_SCHEMA}.control`, 'control')
          .where('control.id_paciente = usuarioRol.id')
      }, 'totalConsultasPaciente')
      .addSelect([
        'usuario.id',
        'usuario.usuario',
        'usuario.correoElectronico',
        'usuario.estado',
        'usuario.ciudadaniaDigital',
        'usuario.fechaCreacion',
        'usuarioRol.id',
        'usuarioRol.estado',
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

    // Ordenamiento dinámico
    switch (orden) {
      case 'nroDocumento':
        datosQuery.addOrderBy('persona.nroDocumento', sentido)
        break
      case 'nombres':
        datosQuery.addOrderBy('persona.nombres', sentido)
        break
      case 'usuario':
        datosQuery.addOrderBy('usuario.usuario', sentido)
        break
      case 'rol':
        datosQuery.addOrderBy('rol.rol', sentido)
        break
      case 'estado':
        datosQuery.addOrderBy('usuario.estado', sentido)
        break
      default:
        datosQuery.addOrderBy('usuario.id', 'ASC')
    }

    // Orden adicional por totalConsultasPaciente si quieres:
    datosQuery.addOrderBy('"totalConsultasPaciente"', 'ASC')

    // Obtener los datos
    const usuarios = await datosQuery.getRawMany()

    // Retornar resultado
    return [usuarios, total]
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
