import { ApiProperty } from '@nestjs/swagger'

export class EstadoDto {
  @ApiProperty({
    type: String,
    example: 'redneuro-backend',
  })
  servicio: string

  @ApiProperty({
    type: String,
    example: '1.12.0',
  })
  version: string

  @ApiProperty({
    type: String,
    example: 'development',
  })
  entorno: string

  @ApiProperty({
    type: String,
    example: 'Activo',
  })
  estado: string

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
  })
  commit_sha: string | null

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
  })
  mensaje: string | null

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
  })
  branch: string | null

  @ApiProperty({
    type: String,
    example: '2025-11-28 12:04:12.954',
  })
  fecha: string

  @ApiProperty({
    type: Number,
    example: 1711826427027,
  })
  hora: number
}
