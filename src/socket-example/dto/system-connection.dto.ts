import { ApiProperty } from '@nestjs/swagger'

export class SystemPingDto {
  @ApiProperty({
    example: 'frontend-app',
    description: 'Identificador del cliente que realiza el ping',
  })
  clientId: string

  @ApiProperty({
    example: '1.0.0',
    description: 'Versión de la app cliente',
  })
  version: string
}

export class SystemPongDto {
  @ApiProperty({
    example: 'ok',
    description: 'Indica que el sistema está activo',
  })
  status: string

  @ApiProperty({
    example: 'Conexión exitosa 🔌',
    description: 'Mensaje devuelto por el servidor',
  })
  message: string

  @ApiProperty({
    example: '2025-12-03T12:00:00Z',
    description: 'Hora exacta de respuesta del sistema',
  })
  timestamp: string
}
