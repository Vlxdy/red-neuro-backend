import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Servicio } from '../entities/estudio.entity'
import { CrearServicioDto, ActualizarServicioDto } from '../dto/estudio.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Especialidad } from '@/application/personal/entities/especialidad.entity'

@Injectable()
export class ServicioRepository {
  constructor(private readonly dataSource: DataSource) {}

  private servicioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Servicio)
  }

  private especialidadRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Especialidad)
  }

  async listarServiciosPaginado(paginacionQuery: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.servicioRepository()
      .createQueryBuilder('servicio')
      .leftJoinAndSelect('servicio.especialidad', 'especialidad')
      .distinct(true)
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nombre':
        query.addOrderBy('servicio.nombre', sentido)
        break
      case 'descripcion':
        query.addOrderBy('servicio.descripcion', sentido)
        break
      case 'duracionMinutos':
        query.addOrderBy('servicio.duracionMinutos', sentido)
        break
      case 'estado':
        query.addOrderBy('servicio.estado', sentido)
        break
      default:
        query.addOrderBy('servicio.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('servicio.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('servicio.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async listarServiciosPorEspecialidadPaginado(
    especialidadId: string,
    paginacionQuery: PaginacionQueryDto
  ) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.servicioRepository()
      .createQueryBuilder('servicio')
      .leftJoinAndSelect('servicio.especialidad', 'especialidad')
      .where('servicio.idEspecialidad = :especialidadId', { especialidadId })
      .distinct(true)
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nombre':
        query.addOrderBy('servicio.nombre', sentido)
        break
      case 'descripcion':
        query.addOrderBy('servicio.descripcion', sentido)
        break
      case 'duracionMinutos':
        query.addOrderBy('servicio.duracionMinutos', sentido)
        break
      case 'estado':
        query.addOrderBy('servicio.estado', sentido)
        break
      default:
        query.addOrderBy('servicio.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('servicio.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('servicio.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async obtenerServicioPorId(id: string, manager?: EntityManager) {
    return await this.servicioRepository(manager).findOne({
      where: { id },
      relations: {
        especialidad: true,
      },
    })
  }

  async obtenerEspecialidadPorId(id: string, manager?: EntityManager) {
    return await this.especialidadRepository(manager).findOne({ where: { id } })
  }

  async crearServicio(
    dto: CrearServicioDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const nuevo = this.servicioRepository(transaccion).create({
      ...dto,
      usuarioCreacion: usuarioAuditoria,
    })

    return await this.servicioRepository(transaccion).save(nuevo)
  }

  async actualizarServicio(
    servicio: Servicio,
    dto: ActualizarServicioDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    Object.assign(servicio, {
      ...dto,
      usuarioModificacion: usuarioAuditoria,
    })

    return await this.servicioRepository(transaccion).save(servicio)
  }

  async eliminarServicio(id: string, transaccion: EntityManager) {
    await this.servicioRepository(transaccion).delete(id)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
