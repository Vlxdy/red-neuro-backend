import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { CrearHistorialMedicoDto } from '../dtos/historial-medico.dto'
import { HistoriaClinica } from '../entities/historia-clinica.entity'

@Injectable()
export class HistorialMedicoRepository {
  constructor(private dataSource: DataSource) {}

  async crearHistorialMedico({
    idMedico,
    usuarioAuditoria,
    data,
    transaccion,
  }: {
    idMedico: string
    data: CrearHistorialMedicoDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const { observaciones, idPaciente } = data
    const historialMedico = new HistoriaClinica({
      idPaciente,
      idMedico,
      observaciones,
      usuarioCreacion: usuarioAuditoria,
    })
    return await transaccion
      .getRepository(HistoriaClinica)
      .save(historialMedico)
  }

  async buscarPorId(id: string, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(HistoriaClinica)
      .createQueryBuilder('historiaClinica')
      .where({ id })
      .getOne()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
