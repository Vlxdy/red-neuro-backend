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
    idEjecutor,
    usuarioAuditoria,
    transaccion,
  }: {
    idCita: string
    estadoAnterior?: CitasEstado | null
    estadoNuevo: CitasEstado
    comentario?: string | null
    rolEjecutor: string
    idEjecutor: string
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const evento = new HistorialCita({
      idCita,
      estado: estadoNuevo,
      estadoAnterior: estadoAnterior || null,
      comentario: comentario || null,
      rolEjecutor,
      idEjecutor,
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
      .leftJoinAndSelect('historial.usuarioEjecutor', 'usuarioEjecutor')
      .leftJoinAndSelect('usuarioEjecutor.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .where({ idCita })
      .orderBy('historial.fechaCreacion', 'DESC')
      .getMany()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
