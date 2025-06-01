import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import {
  AlimentoPlanNutricionalEstado,
  PlanNutricionalEstado,
} from '../constant'
import { AlimentoPlanNutricional } from '../entity/alimento-plan-nutricional.entity'
import { PlanNutricional } from '../entity/plan-nutricional.entity'

@Injectable()
export class AlimentoPlanNutricionalRepository {
  constructor(private dataSource: DataSource) {}

  async crear(
    alimentoPlanNutricional: AlimentoPlanNutricional,
    transaccion?: EntityManager
  ) {
    return await (transaccion || this.dataSource)
      .getRepository(AlimentoPlanNutricional)
      .save(alimentoPlanNutricional)
  }

  async actualizar(
    id: string,
    data: Partial<PlanNutricional>,
    usuario: string
  ) {
    const datosActualizar = new PlanNutricional({
      ...data,
      usuarioModificacion: usuario,
    })
    return await this.dataSource
      .getRepository(PlanNutricional)
      .update(id, datosActualizar)
  }

  async inactivar(id: string, usuario: string) {
    return await this.dataSource
      .getRepository(AlimentoPlanNutricional)
      .update(id, {
        estado: AlimentoPlanNutricionalEstado.INACTIVO,
        usuarioModificacion: usuario,
      })
  }

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(AlimentoPlanNutricional)
      .createQueryBuilder('alimentoPlanNutricional')
      .where({ id })
      .getOne()
  }

  async listarPorIdPlanNutricional(idPlanNutricional: string) {
    const query = this.dataSource
      .getRepository(AlimentoPlanNutricional)
      .createQueryBuilder('alimentoPlanNutricional')
      .where('alimentoPlanNutricional.idPlanNutricional = :idPlanNutricional', {
        idPlanNutricional,
      })
      .andWhere('alimentoPlanNutricional.estado = :estado', {
        estado: PlanNutricionalEstado.ACTIVO,
      })

    return await query.getMany()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
