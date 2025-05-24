import { ApiProperty } from '@nestjs/swagger'
import { IsString } from '../../../common/validation'
import { IsNotEmpty } from 'class-validator'

export class CrearComentarioDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contenido: string
}
