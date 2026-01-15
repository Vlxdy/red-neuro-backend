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
import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi'
import { LoggerService } from '@/core/logger'
import { CitasMedicasService } from '../services/citas-medicas.service'
import {
  MensajeCancelarCitaDto,
  MensajeCitaDto,
  MensajeEstadoCitaDto,
  MensajeReprogramarCitaDto,
} from '../dto/cita.dto'

@WebSocketGateway({
  namespace: '/citas',
  cors: true,
})
export class CitasGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server

  private readonly logger = LoggerService.getInstance()

  constructor(private readonly citasService: CitasMedicasService) {}

  handleConnection(client: Socket) {
    this.logger.info(`Cliente conectado al namespace /citas: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.warn(`Cliente desconectado de /citas: ${client.id}`)
  }

  @AsyncApiSub({
    channel: 'citas:create',
    summary: 'Crear cita vía socket',
    description:
      'Permite al cliente crear citas y recibir la confirmación broadcast',
    message: { name: 'CrearCitaSocket', payload: MensajeCitaDto },
  })
  @AsyncApiPub({
    channel: 'citas:created',
    message: { name: 'CitaCreada', payload: MensajeCitaDto },
  })
  @SubscribeMessage('citas:create')
  async crearCita(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MensajeCitaDto
  ) {
    const cita = await this.citasService.crearCita(payload)
    this.server.emit('citas:created', cita)
    this.logger.debug(`citas:create recibido desde ${client.id}`)
    return cita
  }

  @AsyncApiSub({
    channel: 'citas:estado',
    summary: 'Cambiar estado de cita',
    message: { name: 'ActualizarEstadoCita', payload: MensajeEstadoCitaDto },
  })
  @AsyncApiPub({
    channel: 'citas:estado-actualizado',
    message: { name: 'CitaEstadoActualizado', payload: MensajeEstadoCitaDto },
  })
  @SubscribeMessage('citas:estado')
  async actualizarEstado(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MensajeEstadoCitaDto
  ) {
    const cita = await this.citasService.actualizarEstadoCita(
      payload.id,
      payload
    )
    this.server.emit('citas:estado-actualizado', cita)
    this.logger.debug(
      `citas:estado recibido desde ${client.id} -> ${payload.id}`
    )
    return cita
  }

  @AsyncApiSub({
    channel: 'citas:reprogramar',
    summary: 'Reprograma una cita',
    message: { name: 'ReprogramarCita', payload: MensajeReprogramarCitaDto },
  })
  @AsyncApiPub({
    channel: 'citas:reprogramada',
    message: { name: 'CitaReprogramada', payload: MensajeReprogramarCitaDto },
  })
  @SubscribeMessage('citas:reprogramar')
  async reprogramar(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MensajeReprogramarCitaDto
  ) {
    const cita = await this.citasService.reprogramarCita(payload.id, payload)
    this.server.emit('citas:reprogramada', cita)
    this.logger.debug(
      `citas:reprogramar recibido desde ${client.id} -> ${payload.id}`
    )
    return cita
  }

  @AsyncApiSub({
    channel: 'citas:cancelar',
    summary: 'Cancela una cita',
    message: { name: 'CancelarCita', payload: MensajeCancelarCitaDto },
  })
  @AsyncApiPub({
    channel: 'citas:cancelada',
    message: { name: 'CitaCancelada', payload: MensajeCancelarCitaDto },
  })
  @SubscribeMessage('citas:cancelar')
  async cancelar(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MensajeCancelarCitaDto
  ) {
    const cita = await this.citasService.cancelarCita(payload.id, payload)
    this.server.emit('citas:cancelada', cita)
    this.logger.debug(
      `citas:cancelar recibido desde ${client.id} -> ${payload.id}`
    )
    return cita
  }
}
