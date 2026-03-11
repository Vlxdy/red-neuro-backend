import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
// import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi'
import { LoggerService } from '@/core/logger'
import { CitasMedicasService } from '../services/citas-medicas.service'
import {
  CitaResponseDto,
  MensajeCancelarCitaDto,
  MensajeCitaDto,
  MensajeActualizarCitaDto,
  MensajeEstadoCitaDto,
  MensajeReprogramarCitaDto,
} from '../dto/cita.dto'
import { NotificacionResponseDto } from '../dto/notificacion.dto'
import {
  CITAS_SOCKET_NAMESPACE,
  CitasSocketInboundEvent,
  CitasSocketOutboundEvent,
  NotificacionesSocketInboundEvent,
  NotificacionesSocketOutboundEvent,
} from '../constants'

interface SuscripcionNotificacionesPayload {
  idUsuarioRol: string
}

@WebSocketGateway({
  namespace: CITAS_SOCKET_NAMESPACE,
  cors: true,
})
export class CitasGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server

  private readonly logger = LoggerService.getInstance()

  constructor(private readonly citasService: CitasMedicasService) {}

  handleConnection(client: Socket) {
    this.logger.info(
      `Cliente conectado al namespace ${CITAS_SOCKET_NAMESPACE}: ${client.id}`
    )
  }

  handleDisconnect(client: Socket) {
    this.logger.warn(
      `Cliente desconectado de ${CITAS_SOCKET_NAMESPACE}: ${client.id}`
    )
  }

  @SubscribeMessage(NotificacionesSocketInboundEvent.SUBSCRIBE)
  suscribirseNotificaciones(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SuscripcionNotificacionesPayload
  ) {
    if (!payload?.idUsuarioRol) {
      return { ok: false }
    }

    const room = this.getNotificacionesRoom(payload.idUsuarioRol)
    void client.join(room)

    this.logger.debug(
      `${NotificacionesSocketInboundEvent.SUBSCRIBE} recibido desde ${client.id} -> ${room}`
    )

    return { ok: true, room }
  }

  emitNuevaNotificacion(
    idUsuarioRol: string,
    notificacion: NotificacionResponseDto
  ) {
    this.server
      .to(this.getNotificacionesRoom(idUsuarioRol))
      .emit(NotificacionesSocketOutboundEvent.NUEVA, notificacion)
  }

  emitNotificacionVista(idUsuarioRol: string, idNotificacion: string) {
    this.server
      .to(this.getNotificacionesRoom(idUsuarioRol))
      .emit(NotificacionesSocketOutboundEvent.VISTA, { id: idNotificacion })
  }

  emitNotificacionesTodasVistas(idUsuarioRol: string, total: number) {
    this.server
      .to(this.getNotificacionesRoom(idUsuarioRol))
      .emit(NotificacionesSocketOutboundEvent.TODAS_VISTAS, { total })
  }

  emitCitaCreada(cita: CitaResponseDto) {
    this.server.emit(CitasSocketOutboundEvent.CREATED, cita)
  }

  emitCitaActualizada(cita: CitaResponseDto) {
    this.server.emit(CitasSocketOutboundEvent.ACTUALIZADA, cita)
  }

  emitCitaEstadoActualizado(cita: CitaResponseDto) {
    this.server.emit(CitasSocketOutboundEvent.ESTADO_ACTUALIZADO, cita)
  }

  emitCitaReprogramada(cita: CitaResponseDto) {
    this.server.emit(CitasSocketOutboundEvent.REPROGRAMADA, cita)
  }

  emitCitaCancelada(cita: CitaResponseDto) {
    this.server.emit(CitasSocketOutboundEvent.CANCELADA, cita)
  }

  // @AsyncApiSub({
  //   channel: 'citas:create',
  //   summary: 'Crear cita vía socket',
  //   description:
  //     'Permite al cliente crear citas y recibir la confirmación broadcast',
  //   message: { name: 'CrearCitaSocket', payload: MensajeCitaDto },
  // })
  // @AsyncApiPub({
  //   channel: 'citas:created',
  //   message: { name: 'CitaCreada', payload: MensajeCitaDto },
  // })
  @SubscribeMessage(CitasSocketInboundEvent.CREATE)
  async crearCita(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MensajeCitaDto
  ) {
    const cita = await this.citasService.crearCita(payload)
    this.emitCitaCreada(cita)
    this.logger.debug(
      `${CitasSocketInboundEvent.CREATE} recibido desde ${client.id}`
    )
    return cita
  }

  @SubscribeMessage(CitasSocketInboundEvent.ACTUALIZAR)
  async actualizarCita(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MensajeActualizarCitaDto
  ) {
    const cita = await this.citasService.actualizarCita(payload.id, payload)
    this.emitCitaActualizada(cita)
    this.logger.debug(
      `${CitasSocketInboundEvent.ACTUALIZAR} recibido desde ${client.id} -> ${payload.id}`
    )
    return cita
  }

  // @AsyncApiSub({
  //   channel: 'citas:estado',
  //   summary: 'Cambiar estado de cita',
  //   message: { name: 'ActualizarEstadoCita', payload: MensajeEstadoCitaDto },
  // })
  // @AsyncApiPub({
  //   channel: 'citas:estado-actualizado',
  //   message: { name: 'CitaEstadoActualizado', payload: MensajeEstadoCitaDto },
  // })
  @SubscribeMessage(CitasSocketInboundEvent.ESTADO)
  async actualizarEstado(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MensajeEstadoCitaDto
  ) {
    const cita = await this.citasService.actualizarEstadoCita(
      payload.id,
      payload
    )
    this.emitCitaEstadoActualizado(cita)
    this.logger.debug(
      `${CitasSocketInboundEvent.ESTADO} recibido desde ${client.id} -> ${payload.id}`
    )
    return cita
  }

  // @AsyncApiSub({
  //   channel: 'citas:reprogramar',
  //   summary: 'Reprograma una cita',
  //   message: { name: 'ReprogramarCita', payload: MensajeReprogramarCitaDto },
  // })
  // @AsyncApiPub({
  //   channel: 'citas:reprogramada',
  //   message: { name: 'CitaReprogramada', payload: MensajeReprogramarCitaDto },
  // })
  @SubscribeMessage(CitasSocketInboundEvent.REPROGRAMAR)
  async reprogramar(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MensajeReprogramarCitaDto
  ) {
    const cita = await this.citasService.reprogramarCita(payload.id, payload)
    this.emitCitaReprogramada(cita)
    this.logger.debug(
      `${CitasSocketInboundEvent.REPROGRAMAR} recibido desde ${client.id} -> ${payload.id}`
    )
    return cita
  }

  // @AsyncApiSub({
  //   channel: 'citas:cancelar',
  //   summary: 'Cancela una cita',
  //   message: { name: 'CancelarCita', payload: MensajeCancelarCitaDto },
  // })
  // @AsyncApiPub({
  //   channel: 'citas:cancelada',
  //   message: { name: 'CitaCancelada', payload: MensajeCancelarCitaDto },
  // })
  @SubscribeMessage(CitasSocketInboundEvent.CANCELAR)
  async cancelar(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MensajeCancelarCitaDto
  ) {
    const cita = await this.citasService.cancelarCita(payload.id, payload)
    this.emitCitaCancelada(cita)
    this.logger.debug(
      `${CitasSocketInboundEvent.CANCELAR} recibido desde ${client.id} -> ${payload.id}`
    )
    return cita
  }

  private getNotificacionesRoom(idUsuarioRol: string) {
    return `usuario-rol:${idUsuarioRol}`
  }
}
