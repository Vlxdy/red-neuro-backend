import { ArrayNotEmpty, IsArray, IsString } from 'src/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateNotificacionDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  idNotificaciones: Array<string>
}
