import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { Asignacion } from '../entities/asignados.entity'

@Injectable()
export class AsignacionRepository {
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
    transaccion,
  }: {
    id: string
    datosDto: Partial<Asignacion>
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    const datosActualizar = new Asignacion({
      ...datosDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await (transaccion || this.dataSource)
      .getRepository(Asignacion)
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
    transaccion: EntityManager
  }) {
    const asignacion = new Asignacion({
      idMedico,
      idPaciente,
      usuarioCreacion: usuarioAuditoria,
    })
    return await transaccion.getRepository(Asignacion).save(asignacion)
  }

  async buscarPorPaciente(idPaciente: string, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(Asignacion)
      .createQueryBuilder('asignacion')
      .where({ idPaciente })
      .andWhere('asignacion.estado = :estado', { estado: 'ACTIVO' })
      .getOne()
  }

  async buscarPacientePorIdUsuarioRol(
    idUsuarioRol: string,
    transaccion?: EntityManager
  ) {
    return await (transaccion || this.dataSource)
      .getRepository(Asignacion)
      .createQueryBuilder('asignacion')
      .where({ idPaciente: idUsuarioRol })
      .andWhere('asignacion.estado = :estado', { estado: 'ACTIVO' })
      .getOne()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
