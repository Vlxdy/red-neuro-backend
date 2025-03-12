import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Asignacion } from '../entity/asignacion.entity'

@Injectable()
export class AsignacionesRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Asignacion)
      .createQueryBuilder('asignacion')
      .where({ id })
      .getOne()
  }

  async actualizar({
    id,
    datosDto,
    usuarioAuditoria,
  }: {
    id: string
    datosDto: Partial<Asignacion>
    usuarioAuditoria: string
  }) {
    const datosActualizar = new Asignacion({
      ...datosDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource
      .getRepository(Asignacion)
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
    const asignacion = new Asignacion({
      idMedico,
      idPaciente,
      usuarioCreacion: usuarioAuditoria,
    })
    return await this.dataSource.getRepository(Asignacion).save(asignacion)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
