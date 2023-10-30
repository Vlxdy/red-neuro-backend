import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from '../../../common/validation'

export class ParamGrupoDto {
  @ApiProperty({ name: 'grupo', example: 'TD' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 5)
  grupo: string
}
