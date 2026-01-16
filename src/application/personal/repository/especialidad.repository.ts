import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Especialidad } from '../entities/especialidad.entity'
import {
  ActualizarEspecialidadDto,
  CrearEspecialidadDto,
} from '../dto/especialidad.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

@Injectable()
export class EspecialidadRepository {
  constructor(private readonly dataSource: DataSource) {}

  private especialidadRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Especialidad)
  }

  async listarEspecialidadesPaginado(paginacionQuery: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.especialidadRepository()
      .createQueryBuilder('especialidad')
      .leftJoinAndSelect(
        'especialidad.estudioEspecialidades',
        'estudioEspecialidad'
      )
      .leftJoinAndSelect('estudioEspecialidad.estudio', 'estudio')
      .distinct(true)
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nombre':
        query.addOrderBy('especialidad.nombre', sentido)
        break
      case 'descripcion':
        query.addOrderBy('especialidad.descripcion', sentido)
        break
      case 'colorHex':
        query.addOrderBy('especialidad.colorHex', sentido)
        break
      case 'estado':
        query.addOrderBy('especialidad.estado', sentido)
        break
      default:
        query.addOrderBy('especialidad.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('especialidad.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('especialidad.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async obtenerEspecialidadPorId(id: string, manager?: EntityManager) {
    return await this.especialidadRepository(manager).findOne({
      where: { id },
      relations: {
        estudioEspecialidades: { estudio: true },
      },
    })
  }

  async crearEspecialidad(
    dto: CrearEspecialidadDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const nueva = this.especialidadRepository(transaccion).create({
      ...dto,
      usuarioCreacion: usuarioAuditoria,
    })
    return await this.especialidadRepository(transaccion).save(nueva)
  }

  async actualizarEspecialidad(
    especialidad: Especialidad,
    dto: ActualizarEspecialidadDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    Object.assign(especialidad, {
      ...dto,
      usuarioModificacion: usuarioAuditoria,
    })

    return await this.especialidadRepository(transaccion).save(especialidad)
  }

  async eliminarEspecialidad(id: string, transaccion: EntityManager) {
    await this.especialidadRepository(transaccion).delete(id)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
