import { Transform } from 'class-transformer'
import { IsNotEmpty, NroDocumento } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class CrearUsuarioCiudadaniaDto {
  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @NroDocumento()
  @Transform(({ value }) => value?.trim())
  usuario: string

  @ApiProperty({ example: 'ACTIVO' })
  estado?: string

  @ApiProperty({ example: ['d5de12df-3cc3-5a58-a742-be24030482d8'] })
  @IsNotEmpty()
  roles: Array<string>

  @ApiProperty({ example: false })
  @Transform(() => true)
  ciudadaniaDigital?: boolean = true

  usuarioCreacion?: string
}
