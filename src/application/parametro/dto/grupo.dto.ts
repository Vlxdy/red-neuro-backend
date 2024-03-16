import { IsNotEmpty, IsString, Length } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class ParamGrupoDto {
  @ApiProperty({ name: 'grupo', example: 'TD' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 5)
  grupo: string
}
