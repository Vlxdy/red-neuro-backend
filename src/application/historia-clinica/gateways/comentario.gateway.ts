import { Logger } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { JwtService } from '@nestjs/jwt'
import { Server, Socket } from 'socket.io'
import { ComentarioChatDto } from '../../comunicacion/services/comentario.service'

type ComentarioCambioPayload =
  | {
      tipo: 'creado'
      historiaClinicaId: string
      comentario: ComentarioChatDto
    }
  | {
      tipo: 'actualizado'
      historiaClinicaId: string
      comentario: ComentarioChatDto
    }
  | {
      tipo: 'eliminado'
      historiaClinicaId: string
      comentarioId: string
    }

type SocketUsuario = {
  id?: string
  idUsuarioRol?: string
  idRol?: string
}

type JoinHistoriaClinicaPayload = {
  historiaClinicaId: string
}

@WebSocketGateway({
  namespace: 'comentarios',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ComentarioGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(ComentarioGateway.name)
  private readonly roomPrefix = 'historiaClinica:'

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token = this.extraerToken(client)

    if (!token) {
      this.logger.warn('Conexión de socket rechazada: token ausente')
      client.disconnect(true)
      return
    }

    try {
      const payload = this.jwtService.verify<Record<string, any>>(token)
      const usuario: SocketUsuario = {
        id: payload.id,
        idUsuarioRol: payload.idUsuarioRol,
        idRol: payload.idRol,
      }
      client.data.usuario = usuario
      this.logger.debug(
        `Cliente ${client.id} conectado al canal de comentarios`
      )
    } catch (error) {
      this.logger.warn(
        `Conexión de socket rechazada: ${(error as Error).message}`
      )
      client.disconnect(true)
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Cliente ${client.id} desconectado del canal`)
  }

  @SubscribeMessage('joinHistoriaClinica')
  async manejarUnionHistoriaClinica(
    @MessageBody() data: JoinHistoriaClinicaPayload,
    @ConnectedSocket() client: Socket
  ) {
    if (!data?.historiaClinicaId) {
      return { error: 'historiaClinicaId es requerido' }
    }

    const room = this.obtenerSala(data.historiaClinicaId)
    await client.join(room)
    this.logger.debug(`Cliente ${client.id} unido a sala ${room}`)

    return {
      ok: true,
      historiaClinicaId: data.historiaClinicaId,
    }
  }

  @SubscribeMessage('leaveHistoriaClinica')
  async manejarSalidaHistoriaClinica(
    @MessageBody() data: JoinHistoriaClinicaPayload,
    @ConnectedSocket() client: Socket
  ) {
    if (!data?.historiaClinicaId) {
      return { error: 'historiaClinicaId es requerido' }
    }

    const room = this.obtenerSala(data.historiaClinicaId)
    await client.leave(room)
    this.logger.debug(`Cliente ${client.id} salió de sala ${room}`)

    return {
      ok: true,
      historiaClinicaId: data.historiaClinicaId,
    }
  }

  emitirComentarioCreado(
    historiaClinicaId: string,
    comentario: ComentarioChatDto
  ) {
    if (!this.server) {
      return
    }
    const room = this.obtenerSala(historiaClinicaId)
    this.server.to(room).emit('comentario:creado', comentario)
    this.emitirCambio({
      tipo: 'creado',
      historiaClinicaId,
      comentario,
    })
  }

  emitirComentarioActualizado(
    historiaClinicaId: string,
    comentario: ComentarioChatDto
  ) {
    if (!this.server) {
      return
    }
    const room = this.obtenerSala(historiaClinicaId)
    this.server.to(room).emit('comentario:actualizado', comentario)
    this.emitirCambio({
      tipo: 'actualizado',
      historiaClinicaId,
      comentario,
    })
  }

  emitirComentarioEliminado(historiaClinicaId: string, comentarioId: string) {
    if (!this.server) {
      return
    }
    const room = this.obtenerSala(historiaClinicaId)
    this.server.to(room).emit('comentario:eliminado', { id: comentarioId })
    this.emitirCambio({
      tipo: 'eliminado',
      historiaClinicaId,
      comentarioId,
    })
  }

  private extraerToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token
    if (typeof authToken === 'string' && authToken.trim().length > 0) {
      return authToken
    }

    const headerAuth = client.handshake.headers?.authorization
    if (
      typeof headerAuth === 'string' &&
      headerAuth.toLowerCase().startsWith('bearer ')
    ) {
      return headerAuth.slice(7).trim()
    }

    const queryToken = client.handshake.query?.token
    if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
      return queryToken
    }

    if (Array.isArray(queryToken) && queryToken.length > 0) {
      return String(queryToken[0])
    }

    return undefined
  }

  private obtenerSala(historiaClinicaId: string) {
    return `${this.roomPrefix}${historiaClinicaId}`
  }

  private emitirCambio(evento: ComentarioCambioPayload) {
    if (!this.server) {
      return
    }

    const room = this.obtenerSala(evento.historiaClinicaId)
    this.server.to(room).emit('comentario:cambio', evento)
  }
}
