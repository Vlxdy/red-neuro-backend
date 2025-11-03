import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import {
  PlanNutricionalSeguimientoEstado,
  PlanNutricionalSeguimientoItemEstado,
} from '../constant'
import {
  PlanNutricionalSeguimiento,
  PlanNutricionalSeguimientoItem,
} from '../entity/plan-nutricional-seguimiento.entity'

@Injectable()
export class PlanNutricionalSeguimientoRepository {
  constructor(private readonly dataSource: DataSource) {}

  private getSeguimientoRepository(transaccion?: EntityManager) {
    return (transaccion || this.dataSource).getRepository(
      PlanNutricionalSeguimiento
    )
  }

  private getItemRepository(transaccion?: EntityManager) {
    return (transaccion || this.dataSource).getRepository(
      PlanNutricionalSeguimientoItem
    )
  }

  async buscarPorPlan(idPlanNutricional: string, transaccion?: EntityManager) {
    return await this.getSeguimientoRepository(transaccion)
      .createQueryBuilder('seguimiento')
      .leftJoinAndSelect(
        'seguimiento.items',
        'items',
        'items.estado = :estadoItem',
        { estadoItem: PlanNutricionalSeguimientoItemEstado.ACTIVO }
      )
      .where('seguimiento.idPlanNutricional = :idPlanNutricional', {
        idPlanNutricional,
      })
      .andWhere('seguimiento.estado = :estado', {
        estado: PlanNutricionalSeguimientoEstado.ACTIVO,
      })
      .orderBy('items.fechaCreacion', 'ASC')
      .getOne()
  }

  async crear(
    seguimiento: PlanNutricionalSeguimiento,
    transaccion: EntityManager
  ) {
    return await this.getSeguimientoRepository(transaccion).save(seguimiento)
  }

  async actualizar(
    id: string,
    data: Partial<PlanNutricionalSeguimiento>,
    usuario: string,
    transaccion: EntityManager
  ) {
    const seguimiento = new PlanNutricionalSeguimiento({
      ...data,
      usuarioModificacion: usuario,
    })
    await this.getSeguimientoRepository(transaccion).update(id, seguimiento)
  }

  async inactivarItemsPorSeguimiento(
    idSeguimiento: string,
    usuario: string,
    transaccion: EntityManager
  ) {
    await this.getItemRepository(transaccion).update(
      { idSeguimiento },
      {
        estado: PlanNutricionalSeguimientoItemEstado.INACTIVO,
        usuarioModificacion: usuario,
      }
    )
  }

  async crearItem(
    item: PlanNutricionalSeguimientoItem,
    transaccion: EntityManager
  ) {
    return await this.getItemRepository(transaccion).save(item)
  }
}
