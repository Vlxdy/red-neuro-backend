import { BaseService } from '@/common/base/base-service'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CrearEvaluacionDto } from '../dtos/evaluacion.dto'
import { EvaluacionNutricionalRepository } from '../repositories/evaluacion-nutricional.repository'

@Injectable()
export class EvaluacionNutricionalService extends BaseService {
  constructor(
    private evaluacionNutricionalRepositorio: EvaluacionNutricionalRepository
  ) {
    super()
  }

  async crearEvaluacion(
    idHistoriaClinica: string,
    data: CrearEvaluacionDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<{ id: string }> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearEvaluacion(
          idHistoriaClinica,
          data,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }

      return await this.evaluacionNutricionalRepositorio.runTransaction(op)
    }

    const evaluacion = await this.evaluacionNutricionalRepositorio.crear({
      idHistoriaClinica,
      data,
      usuarioAuditoria,
      transaccion,
    })
    return { id: evaluacion.id }
  }
}
