import { Transform } from 'class-transformer'
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

  @ApiProperty({ example: '71234567' })
  @IsOptional()
  @IsNumberString()
  @Validate(IsNumberInRangeConstraint, [60000000, 79999999])
  telefono?: string | null

  @ApiProperty({ example: '32f26897-cd66-4d1e-9feb-b785994f6a86 ' })
  @IsOptional()
  @IsUUID()
  uuidCiudadano?: string | null
}
