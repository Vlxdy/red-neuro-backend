import { BaseService } from '@/common/base/base-service'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { ExamenesSolicitadosDto } from '../dtos/historial-medico.dto'
import { ExamenSolicitadoRepository } from '../repositories/examen-solicitado.repository'

@Injectable()
export class ExamenSolicitadoService extends BaseService {
  constructor(
    private readonly examenSolicitadoRepositirio: ExamenSolicitadoRepository
  ) {
    super()
  }

  async crearExamenSolicitado({
    idHistorialMedico,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idHistorialMedico: string
    data: ExamenesSolicitadosDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearExamenSolicitado({
          idHistorialMedico,
          data,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }
      return await this.examenSolicitadoRepositirio.runTransaction(op)
    }

    const examenSolicitado =
      await this.examenSolicitadoRepositirio.crearExamenSolicitado({
        idHistorialMedico,
        data,
        usuarioAuditoria,
        transaccion,
      })
    return examenSolicitado
  }
}
