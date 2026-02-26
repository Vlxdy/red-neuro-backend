import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager, In } from 'typeorm'
import { Servicio } from '../entities/servicio.entity'
import {
  ActualizarServicioDto,
  CrearServicioDto,
  ListarServiciosQueryDto,
} from '../dto/servicio.dto'
import { Especialidad } from '@/application/personal/entities/especialidad.entity'
import { ServicioEspecialidad } from '../entities/servicio-especialidad.entity'

@Injectable()
export class ServicioRepository {
  constructor(private readonly dataSource: DataSource) {}

  private servicioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Servicio)
  }

  private especialidadRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Especialidad)
  }

  private servicioEspecialidadRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(ServicioEspecialidad)
  }

  async listarServiciosPaginado(paginacionQuery: ListarServiciosQueryDto) {
    const { limite, saltar, filtro, orden, sentido, tipo } = paginacionQuery

    const query = this.servicioRepository()
      .createQueryBuilder('servicio')
      .leftJoinAndSelect(
        'servicio.servicioEspecialidades',
        'servicioEspecialidades'
      )
      .leftJoinAndSelect('servicioEspecialidades.especialidad', 'especialidad')
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

    if (tipo) {
      query.andWhere('servicio.tipo = :tipo', { tipo })
    }

    return await query.getManyAndCount()
  }

  async listarServiciosPorEspecialidadPaginado(
    especialidadId: string,
    paginacionQuery: ListarServiciosQueryDto
  ) {
    const { limite, saltar, filtro, orden, sentido, tipo } = paginacionQuery

    const query = this.servicioRepository()
      .createQueryBuilder('servicio')
      .innerJoinAndSelect(
        'servicio.servicioEspecialidades',
        'servicioEspecialidades',
        'servicioEspecialidades.especialidadId = :especialidadId',
        { especialidadId }
      )
      .leftJoinAndSelect('servicioEspecialidades.especialidad', 'especialidad')
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

    if (tipo) {
      query.andWhere('servicio.tipo = :tipo', { tipo })
    }

    return await query.getManyAndCount()
  }

  async obtenerServicioPorId(id: string, manager?: EntityManager) {
    return await this.servicioRepository(manager).findOne({
      where: { id },
      relations: {
        servicioEspecialidades: {
          especialidad: true,
        },
      },
    })
  }

  async obtenerEspecialidadPorId(id: string, manager?: EntityManager) {
    return await this.especialidadRepository(manager).findOne({ where: { id } })
  }

  async obtenerEspecialidadesPorIds(ids: string[], manager?: EntityManager) {
    if (ids.length === 0) return []
    return await this.especialidadRepository(manager).findBy({
      id: In(ids),
    })
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

  async crearServicioEspecialidades(
    servicioId: string,
    especialidadIds: string[],
    manager: EntityManager
  ) {
    const repo = this.servicioEspecialidadRepository(manager)
    const idsUnicos = Array.from(new Set(especialidadIds))

    const existentes = await repo.find({
      where: { servicioId, especialidadId: In(idsUnicos) },
    })
    const existentesSet = new Set(
      existentes.map((relacion) => String(relacion.especialidadId))
    )

    const nuevasRelaciones = idsUnicos
      .filter((especialidadId) => !existentesSet.has(String(especialidadId)))
      .map((especialidadId) =>
        repo.create({
          servicioId,
          especialidadId,
        })
      )

    if (nuevasRelaciones.length === 0) {
      return []
    }

    return await repo.save(nuevasRelaciones)
  }

  async reemplazarServicioEspecialidades(
    servicioId: string,
    especialidadIds: string[],
    manager: EntityManager
  ) {
    await this.servicioEspecialidadRepository(manager).delete({ servicioId })

    if (especialidadIds.length === 0) {
      return []
    }

    return await this.crearServicioEspecialidades(
      servicioId,
      especialidadIds,
      manager
    )
  }

  async eliminarServicio(id: string, transaccion: EntityManager) {
    await this.servicioRepository(transaccion).delete(id)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
