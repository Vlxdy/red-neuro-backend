import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { HistorialCita } from '../entities/cita-historial.entity'
import { CitasEstado } from '../constant'

@Injectable()
export class HistorialCitaRepository {
  constructor(private dataSource: DataSource) {}

  async registrarEvento({
    idCita,
    estadoAnterior,
    estadoNuevo,
    comentario,
    rolEjecutor,
    usuarioAuditoria,
    transaccion,
  }: {
    idCita: string
    estadoAnterior?: CitasEstado | null
    estadoNuevo: CitasEstado
    comentario?: string | null
    rolEjecutor: string
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const evento = new HistorialCita({
      idCita,
      estado: estadoNuevo,
      estadoAnterior: estadoAnterior || null,
      comentario: comentario || null,
      rolEjecutor,
      usuarioEjecutor: usuarioAuditoria,
      usuarioCreacion: usuarioAuditoria,
    })

    return await transaccion.getRepository(HistorialCita).save(evento)
  }

  async listarPorCita({
    idCita,
    transaccion,
  }: {
    idCita: string
    transaccion?: EntityManager
  }) {
    return await (transaccion || this.dataSource)
      .getRepository(HistorialCita)
      .createQueryBuilder('historial')
      .where({ idCita })
      .orderBy('historial.fechaCreacion', 'DESC')
      .getMany()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
