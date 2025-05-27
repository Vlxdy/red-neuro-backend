import { BaseService } from '../../../common/base'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'

import { PaginacionQueryDto } from 'src/common/dto/paginacion-query.dto'
import { NotificacionRepository } from '../repositories/notificacion.repository'
import { PacientesService } from '@/application/gestion-pacientes/services/pacientes.service'
import { Notificacion, NotificacionTipo } from '../entities/notificacion.entity'
import { UpdateNotificacionDto } from '../dto/notificacion.dto'
import { NotificacionResponse } from '@/common/types/data-response.type'
import { formatearUsuarioRolRespuesta } from '../utils/formateos'

export enum TipoRecursoNotificacion {
  Tarea = 'Tarea',
  HistoriaUsuario = 'HistoriaUsuario',
  HistoriaUsuarioEtapa = 'HistoriaUsuarioEtapa',
  Peticion = 'Peticion',
  Proyecto = 'Proyecto',
  Etapa = 'Etapa',
}

export interface RecursoNotificacion {
  id: string
  entidad: TipoRecursoNotificacion
}

@Injectable()
export class NotificacionService extends BaseService {
  constructor(
    private notificacionRepositorio: NotificacionRepository,
    // private usuarioRolRepositorio: UsuarioRolRepository,
    private pacienteService: PacientesService
    // private eventsGateway: EventsGateway
  ) {
    super()
  }

  async obtenerNotificaciones(
    idPaciente: string,
    query: PaginacionQueryDto
  ): Promise<[NotificacionResponse[], number]> {
    const paciente = await this.pacienteService.obtenerPaciente(idPaciente)

    const [notificaciones, cantidad] =
      await this.notificacionRepositorio.obtenerNotificaciones(
        query,
        paciente.id
      )
    const notificacionesFormateadas = notificaciones.map((notificacion) =>
      this.formatearNotificacion(notificacion)
    )
    return [notificacionesFormateadas, cantidad]
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
    usuarioAuditoria: string
    transaction: EntityManager
  }) {
    if (!transaction) {
      const op = async (newTransaction: EntityManager) => {
        return await this.crear({
          tipo,
          idPaciente,
          idMedico,
          mensaje,
          idCita,
          usuarioAuditoria,
          transaction: newTransaction,
        })
      }
      return await this.notificacionRepositorio.runTransaction(op)
    }
    await this.pacienteService.obtenerPaciente(idPaciente)

    const notificacion = await this.notificacionRepositorio.crear({
      tipo,
      idPaciente,
      idMedico,
      idCita,
      mensaje,
      usuarioAuditoria,
      transaction,
    })
    return { id: notificacion.id }
    // this.eventsGateway.handleNotification(
    // {
    // id: notificacionDto.idNotificar,
    // },
    // CanalesSockets.NOTIFICACION
    // )
  }

  async actualizarView({
    data,
    idPaciente,
    usuarioAuditoria,
    transaction,
  }: {
    data: UpdateNotificacionDto
    idPaciente: string
    usuarioAuditoria: string
    transaction?: EntityManager
  }) {
    if (!transaction) {
      const op = async (newTransaction: EntityManager) => {
        return await this.actualizarView({
          data,
          idPaciente,
          usuarioAuditoria,
          transaction: newTransaction,
        })
      }
      return await this.notificacionRepositorio.runTransaction(op)
    }

    const { idNotificaciones } = data

    await this.pacienteService.obtenerPaciente(idPaciente, transaction)

    return await this.notificacionRepositorio.actualizarView({
      idNotificaciones,
      idPaciente,
      usuarioAuditoria,
      transaction,
    })
  }
  formatearNotificacion(notificacion: Notificacion): NotificacionResponse {
    return {
      id: notificacion.id,
      idPaciente: notificacion.idPaciente,
      tipo: notificacion.tipo,
      mensaje: notificacion.mensaje,
      visto: notificacion.visto,
      fechaCreacion: notificacion.fechaCreacion,
      idCita: notificacion.idCita,
      medico: notificacion.medico
        ? formatearUsuarioRolRespuesta(notificacion.medico)
        : undefined,
    }
  }
}
