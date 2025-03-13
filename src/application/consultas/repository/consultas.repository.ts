import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Consultas } from '../entity/consultas.entity'

@Injectable()
export class ConsultasRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Consultas)
      .createQueryBuilder('consultas')
      .where({ id })
      .getOne()
  }

  async actualizar({
    id,
    datosDto,
    usuarioAuditoria,
  }: {
    id: string
    datosDto: Partial<Consultas>
    usuarioAuditoria: string
  }) {
    const datosActualizar = new Consultas({
      ...datosDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource
      .getRepository(Consultas)
      .update(id, datosActualizar)
  }

  async crear({
    idMedico,
    idPaciente,
    usuarioAuditoria,
  }: {
    idMedico: string
    idPaciente: string
    usuarioAuditoria: string
  }) {
    const consultas = new Consultas({
      idMedico,
      idPaciente,
      usuarioCreacion: usuarioAuditoria,
    })
    return await this.dataSource.getRepository(Consultas).save(consultas)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
