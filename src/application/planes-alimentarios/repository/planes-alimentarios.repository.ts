import { Brackets, DataSource } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { ActualizarPlanAlimentarioDto, CrearPlanAlimentarioDto } from '../dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { PlanAlimentario } from '../entity'

@Injectable()
export class PlanesAlimentariosRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(PlanAlimentario)
      .createQueryBuilder('parametro')
      .where({ id: id })
      .getOne()
  }

  async actualizar(
    id: string,
    planAlimentarioDto: ActualizarPlanAlimentarioDto,
    usuarioAuditoria: string
  ) {
    const { nombre, descripcion, fechaFin, fechaInicio } = planAlimentarioDto

    return await this.dataSource.getRepository(PlanAlimentario).update(id, {
      nombre,
      descripcion,
      fechaFin,
      fechaInicio,
      usuarioModificacion: usuarioAuditoria,
    })
  }

  async listar(paginacionQueryDto: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQueryDto
    const query = this.dataSource
      .getRepository(PlanAlimentario)
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

  async crear(
    planAlimentarioDto: CrearPlanAlimentarioDto,
    usuarioAuditoria: string
  ) {
    const { nombre, descripcion, fechaFin, fechaInicio } = planAlimentarioDto

    const planAlimentario = new PlanAlimentario({
      nombre,
      descripcion,
      fechaFin,
      fechaInicio,
      usuarioCreacion: usuarioAuditoria,
    })

    return await this.dataSource
      .getRepository(PlanAlimentario)
      .save(planAlimentario)
  }
}
