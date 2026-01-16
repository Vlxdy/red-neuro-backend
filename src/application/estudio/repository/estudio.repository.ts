import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Estudio } from '../entities/estudio.entity'
import { CrearEstudioDto, ActualizarEstudioDto } from '../dto/estudio.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Especialidad } from '@/application/personal/entities/especialidad.entity'
import { EstudioEspecialidad } from '../entities/estudio-especialidad.entity'

@Injectable()
export class EstudioRepository {
  constructor(private readonly dataSource: DataSource) {}

  private estudioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Estudio)
  }

  private especialidadRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Especialidad)
  }

  private estudioEspecialidadRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(EstudioEspecialidad)
  }

  async listarEstudiosPaginado(paginacionQuery: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.estudioRepository()
      .createQueryBuilder('estudio')
      .leftJoinAndSelect('estudio.estudioEspecialidades', 'estudioEspecialidad')
      .leftJoinAndSelect('estudioEspecialidad.especialidad', 'especialidad')
      .distinct(true)
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nombre':
        query.addOrderBy('estudio.nombre', sentido)
        break
      case 'descripcion':
        query.addOrderBy('estudio.descripcion', sentido)
        break
      case 'duracionMinutos':
        query.addOrderBy('estudio.duracionMinutos', sentido)
        break
      case 'estado':
        query.addOrderBy('estudio.estado', sentido)
        break
      default:
        query.addOrderBy('estudio.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('estudio.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('estudio.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async obtenerEstudioPorId(id: string, manager?: EntityManager) {
    return await this.estudioRepository(manager).findOne({
      where: { id },
      relations: {
        estudioEspecialidades: { especialidad: true },
      },
    })
  }

  async obtenerEspecialidadPorId(id: string, manager?: EntityManager) {
    return await this.especialidadRepository(manager).findOne({ where: { id } })
  }

  async crearEstudio(
    dto: CrearEstudioDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const nuevo = this.estudioRepository(transaccion).create({
      ...dto,
      usuarioCreacion: usuarioAuditoria,
    })

    return await this.estudioRepository(transaccion).save(nuevo)
  }

  async actualizarEstudio(
    estudio: Estudio,
    dto: ActualizarEstudioDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    Object.assign(estudio, {
      ...dto,
      usuarioModificacion: usuarioAuditoria,
    })

    return await this.estudioRepository(transaccion).save(estudio)
  }

  async buscarRelacionEstudioEspecialidad(
    estudioId: string,
    especialidadId: string,
    manager?: EntityManager
  ) {
    return await this.estudioEspecialidadRepository(manager).findOne({
      where: { estudioId, especialidadId },
    })
  }

  async crearRelacionEstudioEspecialidad(
    estudio: Estudio,
    especialidad: Especialidad,
    transaccion: EntityManager
  ) {
    const relacion = this.estudioEspecialidadRepository(transaccion).create({
      estudio,
      estudioId: estudio.id,
      especialidad,
      especialidadId: especialidad.id,
    })
    return await this.estudioEspecialidadRepository(transaccion).save(relacion)
  }

  async eliminarEstudio(id: string, transaccion: EntityManager) {
    await this.estudioRepository(transaccion).delete(id)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
