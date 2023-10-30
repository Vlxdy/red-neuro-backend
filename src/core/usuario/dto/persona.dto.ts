import { Transform } from 'class-transformer'
import {
  IsNotEmpty,
  IsString,
  NombreApellido,
  NroDocumento,
  IsDateString,
  ValidateIf,
} from '../../../common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class PersonaDto {
  @ApiProperty({ example: '4192299' })
  @IsNotEmpty()
  @NroDocumento()
  @Transform(({ value }) => value?.trim())
  nroDocumento: string

  tipoDocumento?: string

  @ApiProperty({ example: 'MARIELA' })
  @IsNotEmpty()
  @NombreApellido()
  nombres: string

  @ApiProperty({ example: 'ALCAZAR' })
  @IsString()
  @ValidateIf((o) => !o.segundoApellido)
  @NombreApellido()
  primerApellido?: string

  @ApiProperty({ example: 'ALMARAZ' })
  @ValidateIf((o) => !o.primerApellido)
  @NombreApellido()
  segundoApellido?: string
  @ApiProperty({ example: '2002-05-04' })
  @IsDateString()
  fechaNacimiento?: Date | null
}
