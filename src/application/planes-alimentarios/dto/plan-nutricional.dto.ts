import { IsArray, IsNotEmpty, IsString } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'
import { TipoAlimento } from '../entity/alimento.entity'

export class CrearPlanNutricionalDto {
  @ApiProperty({ example: 'Fecha del plan diario' })
  @IsNotEmpty()
  @IsString()
  fecha: string

  @IsArray()
  alimentos: {
    idAlimento: string
    cantidad: number
    tipo: TipoAlimento
  }[]

  @ApiProperty({ example: 'id usuario rol' })
  @IsNotEmpty()
  @IsString()
  idUsuarioRol: string
}

export class ActualizarPlanNutricionalDto {
  @IsArray()
  alimentos: {
    idAlimento: string
    cantidad: number
    tipo: TipoAlimento
  }[]
}
