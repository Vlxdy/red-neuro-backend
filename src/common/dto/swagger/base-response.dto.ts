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

export type BaseResponseListRowsDto<T> = BaseResponseDto<{
  total: number
  filas: T[]
}>
