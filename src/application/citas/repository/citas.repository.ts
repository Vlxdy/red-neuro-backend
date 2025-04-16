import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Cita } from '../entity/cita.entity'
import { CrearCitaDto } from '../dto/citas.dto'

@Injectable()
export class CitasRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(Cita)
      .createQueryBuilder('citas')
      .where({ id })
      .getOne()
  }

  async actualizar({
    id,
    datosDto,
    usuarioAuditoria,
  }: {
    id: string
    datosDto: Partial<Cita>
    usuarioAuditoria: string
  }) {
    const datosActualizar = new Cita({
      ...datosDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource.getRepository(Cita).update(id, datosActualizar)
  }

  async crear({
    idMedico,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idMedico: string
    data: CrearCitaDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const { idPaciente, detalle, fechaFin, fechaInicio } = data
    const consultas = new Cita({
      idMedico,
      idPaciente,
      detalle,
      fechaFin,
      fechaInicio,
      usuarioCreacion: usuarioAuditoria,
    })
    return await transaccion.getRepository(Cita).save(consultas)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
