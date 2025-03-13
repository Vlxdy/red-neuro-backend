import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Seguimiento } from '../entity/seguimiento.entity'

@Injectable()
export class SeguimientoRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Seguimiento)
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
    datosDto: Partial<Seguimiento>
    usuarioAuditoria: string
  }) {
    const datosActualizar = new Seguimiento({
      ...datosDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource
      .getRepository(Seguimiento)
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
    const seguimiento = new Seguimiento({
      idMedico,
      idPaciente,
      usuarioCreacion: usuarioAuditoria,
    })
    return await this.dataSource.getRepository(Seguimiento).save(seguimiento)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
