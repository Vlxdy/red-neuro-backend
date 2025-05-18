import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { HistorialMedico } from '../entities/historial-medico.entity'
import { CrearHistorialMedicoDto } from '../dtos/historial-medico.dto'

@Injectable()
export class HistorialMedicoRepository {
  constructor(private dataSource: DataSource) {}

  async crearHistorialMedico({
    idMedico,
    idCita,
    usuarioAuditoria,
    data,
    transaccion,
  }: {
    idMedico: string
    idCita: string
    data: CrearHistorialMedicoDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const {
      sintomas,
      observaciones,
      evaluacionFisica,
      idPaciente,
      motivoConsulta,
    } = data
    const historialMedico = new HistorialMedico({
      idPaciente,
      idMedico,
      idCita,
      sintomas,
      observaciones,
      evaluacionFisica,
      motivoConsulta,
      usuarioCreacion: usuarioAuditoria,
    })
    return await transaccion
      .getRepository(HistorialMedico)
      .save(historialMedico)
  }

  async buscarPorId(id: string, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(HistorialMedico)
      .createQueryBuilder('historialMedico')
      .where({ id })
      .getOne()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
