import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Consultorio } from '../entities/consultorio.entity'
import {
  ActualizarConsultorioDto,
  CrearConsultorioDto,
} from '../dto/consultorio.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

@Injectable()
export class ConsultorioRepository {
  constructor(private readonly dataSource: DataSource) {}

  private consultorioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Consultorio)
  }

  async listarConsultorios() {
    return await this.consultorioRepository().find({
      order: { nombre: 'ASC' },
    })
  }

  async listarConsultoriosPaginado(paginacionQuery: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.consultorioRepository()
      .createQueryBuilder('consultorio')
      .select([
        'consultorio.id',
        'consultorio.nombre',
        'consultorio.descripcion',
        'consultorio.estado',
        'consultorio.colorHex',
      ])
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nombre':
        query.addOrderBy('consultorio.nombre', sentido)
        break
      case 'descripcion':
        query.addOrderBy('consultorio.descripcion', sentido)
        break
      case 'colorHex':
        query.addOrderBy('consultorio.colorHex', sentido)
        break
      case 'estado':
        query.addOrderBy('consultorio.estado', sentido)
        break
      default:
        query.addOrderBy('consultorio.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('consultorio.nombre ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('consultorio.descripcion ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }
    return await query.getManyAndCount()
  }

  async obtenerConsultorioPorId(id: string, manager?: EntityManager) {
    return await this.consultorioRepository(manager).findOne({ where: { id } })
  }

  async buscarConsultorioPorNombre(nombre: string) {
    return await this.consultorioRepository()
      .createQueryBuilder('agrupador')
      .where('LOWER(agrupador.nombre) = LOWER(:nombre)', { nombre })
      .getOne()
  }

  async crearConsultorio(
    dto: CrearConsultorioDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const nuevo = this.consultorioRepository(transaccion).create({
      ...dto,
      usuarioCreacion: usuarioAuditoria,
    })
    return await this.consultorioRepository(transaccion).save(nuevo)
  }

  async actualizarConsultorio(
    consultorio: Consultorio,
    dto: ActualizarConsultorioDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    Object.assign(consultorio, {
      ...dto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.consultorioRepository(transaccion).save(consultorio)
  }

  async eliminarConsultorio(id: string) {
    await this.consultorioRepository().delete(id)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
