import { ApiProperty } from '@nestjs/swagger'

export class ErrorResponseDto {
  @ApiProperty({
    example: false,
    description:
      'Indica si la operación fue exitosa o no. Para errores siempre es false.',
  })
  finalizado: boolean

  @ApiProperty({
    example: 412,
    description: 'Código HTTP correspondiente al error generado.',
  })
  codigo: number

  @ApiProperty({
    example: 1764346118,
    description: 'Marca de tiempo Unix (segundos) cuando ocurrió el error.',
  })
  timestamp: number

  @ApiProperty({
    example: 'Precondición fallida: falta el campo X',
    description:
      'Mensaje orientado al cliente que describe el motivo del error.',
  })
  mensaje: string

  @ApiProperty({
    example: null,
    description:
      'Información adicional útil para el cliente. Puede incluir detalles específicos del error.',
    required: false,
  })
  datos?: unknown
}
