import { IsArray, IsNotEmpty, IsString } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class CrearPlanNutricionalDto {
  @ApiProperty({ example: 'Fecha del plan diario' })
  @IsNotEmpty()
  @IsString()
  fecha: string

  @IsArray()
  alimentos: string[]

  @ApiProperty({ example: 'id usuario rol' })
  @IsNotEmpty()
  @IsString()
  idUsuarioRol: string
}
