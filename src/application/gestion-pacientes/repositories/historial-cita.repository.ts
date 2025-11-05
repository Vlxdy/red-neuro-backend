import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { HistorialCita } from '../entities/cita-historial.entity'
import { CitasEstado } from '../constant'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

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
    paginacionQuery,
  }: {
    idCita: string
    transaccion?: EntityManager
    paginacionQuery: PaginacionQueryDto
  }) {
    const { limite, saltar, orden, sentido } = paginacionQuery

    const query = (transaccion || this.dataSource)
      .getRepository(HistorialCita)
      .createQueryBuilder('historial')
      .leftJoinAndSelect('historial.usuarioEjecutor', 'usuarioEjecutor')
      .leftJoinAndSelect('usuarioEjecutor.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .where({ idCita })

      .take(limite)
      .skip(saltar)
    if (orden) {
      switch (orden) {
        case 'fechaCreacion':
          query.addOrderBy('historial.fechaCreacion', sentido)
          break
        case 'estado':
          query.addOrderBy('historial.estado', sentido)
          break
        default:
          query.addOrderBy('historial.fechaCreacion', 'DESC')
      }
    }
    return await query.getManyAndCount()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
