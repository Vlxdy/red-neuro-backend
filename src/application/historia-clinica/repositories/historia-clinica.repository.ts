import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { HistoriaClinica } from '../entities/historia-clinica.entity'

@Injectable()
export class HistoriaClinicaRepository {
  constructor(private dataSource: DataSource) {}

  async crearHistoriaClinica({
    idMedico,
    idPaciente,
    usuarioAuditoria,
    transaccion,
  }: {
    idMedico: string
    idPaciente: string
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const historiaClinica = new HistoriaClinica({
      idPaciente,
      idMedico,
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
      .leftJoinAndSelect('historiaClinica.paciente', 'paciente')
      .leftJoinAndSelect('paciente.usuario', 'usuarioPaciente')
      .leftJoinAndSelect('usuarioPaciente.persona', 'personaPaciente')
      .where({ id })
      .getOne()
  }
  async buscarPorPaciente(idPaciente: string, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(HistoriaClinica)
      .createQueryBuilder('historiaClinica')
      .where({ idPaciente })
      .andWhere('historiaClinica.estado = :estado', {
        estado: 'ACTIVO',
      })
      .getOne()
  }

  async buscarPorPacienteCompleto(
    idPaciente: string,
    transaccion?: EntityManager
  ) {
    return await (transaccion || this.dataSource)
      .getRepository(HistoriaClinica)
      .createQueryBuilder('historiaClinica')
      .where({ idPaciente })
      .andWhere('historiaClinica.estado = :estado', {
        estado: 'ACTIVO',
      })
      // .leftJoinAndSelect('historiaClinica.archivosAdjuntos', 'archivos')
      .leftJoinAndSelect(
        'historiaClinica.evaluacionNutricional',
        'evaluacionNutricional'
      )
      .leftJoinAndSelect('historiaClinica.paciente', 'paciente')
      .leftJoinAndSelect('paciente.usuario', 'usuarioPaciente')
      .leftJoinAndSelect('usuarioPaciente.persona', 'personaMedico')
      // .leftJoinAndSelect('paciente.persona', 'personaPaciente')
      .leftJoinAndSelect('historiaClinica.medico', 'medico')
      .leftJoinAndSelect('medico.usuario', 'usuarioMedico')
      .leftJoinAndSelect('usuarioMedico.persona', 'personaUsuarioMedico')
      // .leftJoinAndSelect('usuarioMedico.persona', 'personaUsuarioMedico')
      // .leftJoinAndSelect('medico.persona', 'personaMedico')
      .getOne()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
