import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'

import { PaginacionQueryDto } from 'src/common/dto/paginacion-query.dto'
import { Notificacion, NotificacionTipo } from '../entities/notificacion.entity'

@Injectable()
export class NotificacionRepository {
  constructor(private dataSource: DataSource) {}

  async obtenerNotificaciones(
    paginacionQueryDto: PaginacionQueryDto,
    idPaciente: string
  ) {
    const { limite, saltar } = paginacionQueryDto
    const query = this.dataSource
      .getRepository(Notificacion)
      .createQueryBuilder('notificacion')
      .leftJoinAndSelect('notificacion.medico', 'medico')
      .leftJoinAndSelect('medico.usuario', 'usuarioMedico')
      .leftJoinAndSelect('usuarioMedico.persona', 'personaMedico')
      .leftJoinAndSelect('notificacion.paciente', 'paciente')
      .leftJoinAndSelect('paciente.usuario', 'usuarioPaciente')
      .leftJoinAndSelect('usuarioPaciente.persona', 'personaPaciente')
      .take(limite)
      .skip(saltar)
      .orderBy({
        'notificacion.visto': 'ASC', // Esto pone los 'true' primero
        'notificacion.id': 'DESC', // Luego ordena por fecha de modificación
      })
      .where('notificacion.idPaciente = :idPaciente', { idPaciente })

    return await query.getManyAndCount()
  }
  async crear({
    tipo,
    idPaciente,
    idMedico,
    idCita,
    mensaje,
    usuarioAuditoria,
    transaction,
  }: {
    tipo: NotificacionTipo
    idPaciente: string
    idMedico?: string
    idCita?: string
    mensaje: string
    usuarioAuditoria?: string
    transaction: EntityManager
  }): Promise<Notificacion> {
    const nuevaNotificacion = new Notificacion({
      idPaciente,
      idMedico,
      idCita,
      tipo,
      usuarioCreacion: usuarioAuditoria,
      mensaje,
    })
    return await transaction.getRepository(Notificacion).save(nuevaNotificacion)
  }

  async actualizarView({
    idNotificaciones,
    usuarioAuditoria,
    idPaciente,
    transaction,
  }: {
    idNotificaciones: Array<string>
    idPaciente: string
    usuarioAuditoria: string
    transaction: EntityManager
  }) {
    const query = transaction
      .getRepository(Notificacion)
      .createQueryBuilder()
      .update(Notificacion)
      .set({ visto: true, usuarioModificacion: usuarioAuditoria })
      .where('id IN (:...idNotificaciones)', { idNotificaciones })
      .andWhere('idPaciente = :idPaciente', { idPaciente })
    return await query.execute()
  }

  async runTransaction<T>(
    op: (entityManager: EntityManager) => Promise<T>
  ): Promise<T> {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
