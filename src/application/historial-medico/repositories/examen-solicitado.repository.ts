import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { HistorialMedico } from '../entities/historial-medico.entity'
import { ExamenesSolicitadosDto } from '../dtos/historial-medico.dto'
import { ExamenSolicitado } from '../entities/examen-solicitado.entity'

@Injectable()
export class ExamenSolicitadoRepository {
  constructor(private dataSource: DataSource) {}

  async crearExamenSolicitado({
    idHistorialMedico,
    usuarioAuditoria,
    data,
    transaccion,
  }: {
    idHistorialMedico: string
    data: ExamenesSolicitadosDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const { instrucciones, nombreExamen } = data
    const historialMedico = new ExamenSolicitado({
      idHistorialMedico,
      instrucciones,
      nombreExamen,
      usuarioCreacion: usuarioAuditoria,
    })
    return await transaccion
      .getRepository(HistorialMedico)
      .save(historialMedico)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
