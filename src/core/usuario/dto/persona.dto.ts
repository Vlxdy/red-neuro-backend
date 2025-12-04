import { Transform } from 'class-transformer'
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  NombreApellido,
  NroDocumento,
  ValidateIf,
  IsNumberString,
  IsNumberInRangeConstraint,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'
import { Validate } from 'class-validator'

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
  @Transform(({ value }) => value?.trim().toUpperCase())
  nombres: string

  @ApiProperty({ example: 'ALCAZAR' })
  @IsString()
  @ValidateIf((o) => !o.segundoApellido)
  @NombreApellido()
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsOptional()
  primerApellido?: string | null

  @ApiProperty({ example: 'ALMARAZ' })
  @ValidateIf((o) => !o.primerApellido)
  @NombreApellido()
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsOptional()
  segundoApellido?: string | null

  @ApiProperty({ example: '2002-05-04' })
  @IsDateString()
  @IsOptional()
  fechaNacimiento?: Date | null

  @ApiProperty({ example: '71234567' })
  @IsOptional()
  @IsNumberString()
  @Validate(IsNumberInRangeConstraint, [60000000, 79999999])
  telefono?: string | null

  @ApiProperty({ example: 'F' })
  @IsOptional()
  @IsString()
  genero?: string | null
}
