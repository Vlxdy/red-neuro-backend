import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto'
import { Brackets, DataSource } from 'typeorm'
import { CrearParametroDto } from './dto/crear-parametro.dto'
import { Parametro } from './parametro.entity'
import { Injectable } from '@nestjs/common'
import { ActualizarParametroDto } from './dto/actualizar-parametro.dto'
import { Status } from '../../common/constants'

@Injectable()
export class ParametroRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Parametro)
      .createQueryBuilder('parametro')
      .where({ id: id })
      .getOne()
  }

  async actualizar(
    id: string,
    parametroDto: ActualizarParametroDto,
    usuarioAuditoria: string
  ) {
    return await this.dataSource.getRepository(Parametro).update(
      id,
      new Parametro({
        ...parametroDto,
        usuarioModificacion: usuarioAuditoria,
      })
    )
  }

  async listar(paginacionQueryDto: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQueryDto
    const query = this.dataSource
      .getRepository(Parametro)
      .createQueryBuilder('parametro')
      .select([
        'parametro.id',
        'parametro.codigo',
        'parametro.nombre',
        'parametro.grupo',
        'parametro.descripcion',
        'parametro.estado',
      ])
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'codigo':
        query.addOrderBy('parametro.codigo', sentido)
        break
      case 'nombre':
        query.addOrderBy('parametro.nombre', sentido)
        break
      case 'descripcion':
        query.addOrderBy('parametro.descripcion', sentido)
        break
      case 'grupo':
        query.addOrderBy('parametro.grupo', sentido)
        break
      case 'estado':
        query.addOrderBy('parametro.estado', sentido)
        break
      default:
        query.orderBy('parametro.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('parametro.codigo like :filtro', { filtro: `%${filtro}%` })
          qb.orWhere('parametro.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('parametro.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('parametro.grupo ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }
    return await query.getManyAndCount()
  }

  async listarPorGrupo(grupo: string) {
    return await this.dataSource
      .getRepository(Parametro)
      .createQueryBuilder('parametro')
      .select(['parametro.id', 'parametro.codigo', 'parametro.nombre'])
      .where('parametro.grupo = :grupo', {
        grupo,
      })
      .andWhere('parametro.estado = :estado', {
        estado: Status.ACTIVE,
      })
      .getMany()
  }

  async buscarCodigo(codigo: string) {
    return this.dataSource
      .getRepository(Parametro)
      .findOne({ where: { codigo: codigo } })
  }

  async crear(parametroDto: CrearParametroDto, usuarioAuditoria: string) {
    return await this.dataSource
      .getRepository(Parametro)
      .save(
        new Parametro({ ...parametroDto, usuarioCreacion: usuarioAuditoria })
      )
  }
}
