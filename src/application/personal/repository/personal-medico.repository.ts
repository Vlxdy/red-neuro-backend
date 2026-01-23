import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { RolEstado, UsuarioRolEstado } from '@/core/authorization/constant'
import { RolEnum } from '@/core/authorization/rol.enum'

@Injectable()
export class PersonalMedicoRepository {
  constructor(private readonly dataSource: DataSource) {}

  async listarPersonalMedicoPaginado(paginacionQuery: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.dataSource
      .getRepository(UsuarioRol)
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
}
