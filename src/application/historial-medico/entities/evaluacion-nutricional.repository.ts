import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { CrearEvaluacionDto } from '../dtos/evaluacion.dto'
import { EvaluacionNutricional } from './evaluacion-nutricional.entity'

@Injectable()
export class EvaluacionNutricionalRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(EvaluacionNutricional)
      .createQueryBuilder('evaluacion')
      .where({ id })
      .getOne()
  }

  async actualizar({
    id,
    datosDto,
    usuarioAuditoria,
  }: {
    id: string
    datosDto: Partial<EvaluacionNutricional>
    usuarioAuditoria: string
  }) {
    const datosActualizar = new EvaluacionNutricional({
      ...datosDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource
      .getRepository(EvaluacionNutricional)
      .update(id, datosActualizar)
  }

  async crear({
    idHistorialMedico,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idHistorialMedico: string
    data: CrearEvaluacionDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const { diagnostico, imc, peso, talla } = data
    const consultas = new EvaluacionNutricional({
      idHistorialMedico,
      diagnostico,
      imc,
      peso,
      talla,
      usuarioCreacion: usuarioAuditoria,
    })
    return await transaccion
      .getRepository(EvaluacionNutricional)
      .save(consultas)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
