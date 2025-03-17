import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Control } from '../entity/control.entity'

@Injectable()
export class ControlRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Control)
      .createQueryBuilder('control')
      .where({ id })
      .getOne()
  }

  async actualizar({
    id,
    datosDto,
    usuarioAuditoria,
    transaccion,
  }: {
    id: string
    datosDto: Partial<Control>
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    const datosActualizar = new Control({
      ...datosDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await (transaccion || this.dataSource)
      .getRepository(Control)
      .update(id, datosActualizar)
  }

  async crear({
    idMedico,
    idPaciente,
    usuarioAuditoria,
    transaccion,
  }: {
    idMedico: string
    idPaciente: string
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    const seguimiento = new Control({
      idMedico,
      idPaciente,
      usuarioCreacion: usuarioAuditoria,
    })
    return await (transaccion || this.dataSource)
      .getRepository(Control)
      .save(seguimiento)
  }

  async buscarPorPaciente(idPaciente: string, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(Control)
      .createQueryBuilder('control')
      .where({ idPaciente })
      .andWhere('control.estado = :estado', { estado: 'ACTIVO' })
      .getOne()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
