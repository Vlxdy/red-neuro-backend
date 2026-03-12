import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Ocupacion } from '../entities/ocupacion.entity'
import { ActualizarOcupacionDto, CrearOcupacionDto } from '../dto/ocupacion.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

@Injectable()
export class OcupacionRepository {
  constructor(private readonly dataSource: DataSource) {}

  private ocupacionRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Ocupacion)
  }

  async listarOcupacionesPaginado(paginacionQuery: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.ocupacionRepository()
      .createQueryBuilder('ocupacion')
      .leftJoinAndSelect('ocupacion.servicioOcupaciones', 'servicioOcupaciones')
      .leftJoinAndSelect('servicioOcupaciones.servicio', 'servicio')
      .distinct(true)
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nombre':
        query.addOrderBy('ocupacion.nombre', sentido)
        break
      case 'descripcion':
        query.addOrderBy('ocupacion.descripcion', sentido)
        break
      case 'grado':
        query.addOrderBy('ocupacion.grado', sentido)
        break
      case 'estado':
        query.addOrderBy('ocupacion.estado', sentido)
        break
      default:
        query.addOrderBy('ocupacion.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('ocupacion.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('ocupacion.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('ocupacion.grado ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async obtenerOcupacionPorId(id: string, manager?: EntityManager) {
    return await this.ocupacionRepository(manager).findOne({
      where: { id },
      relations: {
        servicioOcupaciones: {
          servicio: true,
        },
      },
    })
  }

  async crearOcupacion(
    dto: CrearOcupacionDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const nueva = this.ocupacionRepository(transaccion).create({
      ...dto,
      usuarioCreacion: usuarioAuditoria,
    })
    return await this.ocupacionRepository(transaccion).save(nueva)
  }

  async actualizarOcupacion(
    ocupacion: Ocupacion,
    dto: ActualizarOcupacionDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    Object.assign(ocupacion, {
      ...dto,
      usuarioModificacion: usuarioAuditoria,
    })

    return await this.ocupacionRepository(transaccion).save(ocupacion)
  }

  async eliminarOcupacion(id: string, transaccion: EntityManager) {
    await this.ocupacionRepository(transaccion).delete(id)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
