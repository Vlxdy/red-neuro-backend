import { ApiProperty } from '@nestjs/swagger'

export class BaseResponseDto<T> {
  @ApiProperty({ example: true })
  finalizado: boolean

  @ApiProperty({ example: '¡Tarea completada con éxito!' })
  mensaje: string

  @ApiProperty({
    description: 'Contenido de la respuesta',
  })
  datos: T
}
