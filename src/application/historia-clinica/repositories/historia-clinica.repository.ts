import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { HistoriaClinica } from '../entities/historia-clinica.entity'
import { CrearHistoriaClinicaDto } from '../dtos/historia-clinica.dto'

@Injectable()
export class HistoriaClinicaRepository {
  constructor(private dataSource: DataSource) {}

  async crearHistoriaClinica({
    idMedico,
    usuarioAuditoria,
    data,
    transaccion,
  }: {
    idMedico: string
    data: CrearHistoriaClinicaDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const { observaciones, idPaciente } = data
    const historiaClinica = new HistoriaClinica({
      idPaciente,
      idMedico,
      observaciones,
      usuarioCreacion: usuarioAuditoria,
    })
    return await transaccion
      .getRepository(HistoriaClinica)
      .save(historiaClinica)
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
