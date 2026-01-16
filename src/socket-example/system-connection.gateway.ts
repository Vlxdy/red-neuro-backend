import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

// import { AsyncApiSub } from 'nestjs-asyncapi'
import { LoggerService } from '@/core/logger'
import { SystemPingDto, SystemPongDto } from './dto/system-connection.dto'

@WebSocketGateway({
  namespace: '/system',
  cors: true,
})
export class SystemConnectionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private logger: LoggerService = LoggerService.getInstance()

  handleConnection(client: Socket) {
    this.logger.info(`🟢 Cliente conectado al namespace /system: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.warn(`🔴 Cliente desconectado: ${client.id}`)
  }

  // ====== CLIENTE → SERVIDOR ======
  // @AsyncApiSub({
  //   channel: 'system:ping',
  //   summary: 'El cliente prueba la conexión con el sistema',
  //   message: {
  //     name: 'SystemPing',
  //     payload: SystemPingDto,
  //   },
  // })
  @SubscribeMessage('system:ping')
  handlePing(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SystemPingDto
  ): SystemPongDto {
    const response: SystemPongDto = {
      status: 'ok',
      message: `Conexión exitosa con el sistema`,
      timestamp: new Date().toISOString(),
    }

    this.logger.debug(
      `📩 system:ping recibido desde ${client.id} (clientId=${data.clientId}, version=${data.version})`
    )

    client.emit('system:pong', response)

    return response
  }
}
