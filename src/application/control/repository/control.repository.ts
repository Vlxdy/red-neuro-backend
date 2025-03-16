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
  }: {
    id: string
    datosDto: Partial<Control>
    usuarioAuditoria: string
  }) {
    const datosActualizar = new Control({
      ...datosDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource
      .getRepository(Control)
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
    const seguimiento = new Control({
      idMedico,
      idPaciente,
      usuarioCreacion: usuarioAuditoria,
    })
    return await this.dataSource.getRepository(Control).save(seguimiento)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
