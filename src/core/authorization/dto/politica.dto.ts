import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class PoliticaDto {
  @ApiProperty({ example: 'ADMINISTRADOR' })
  @IsNotEmpty()
  sujeto: string

  @ApiProperty({ example: '/admin/parametros' })
  @IsNotEmpty()
  objeto: string

  @ApiProperty({ example: 'create|update|delete|read' })
  @IsNotEmpty()
  accion: string

  @ApiProperty({ example: 'frontend' })
  @IsNotEmpty()
  app: string
}
