import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumberString,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'
import {
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: false })
class IsNumericStringConstraint implements ValidatorConstraintInterface {
  // eslint-disable-next-line
  validate(value: string, args: ValidationArguments): boolean {
    return !isNaN(Number(value)) // Verifica si la cadena es un número
  }
  // eslint-disable-next-line
  defaultMessage(args: ValidationArguments): string {
    return 'Each element must be a numeric string'
  }
}

export class CrearAsignacionDto {
  @ApiProperty({
    description: 'Clave foránea que referencia al medico idRolUsuario',
    example: '2',
  })
  @IsNotEmpty()
  @IsNumberString()
  idMedico: string

  @ApiProperty({
    description: 'Clave foránea que referencia a los pacientes',
    example: ['3', '5', '7'],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @Validate(IsNumericStringConstraint, { each: true })
  idPacientes: Array<string>
}

export class ModificarAsignacionDto {
  @ApiProperty({
    description: 'Clave foránea que referencia al medico idRolUsuario',
    example: '2',
  })
  @IsNotEmpty()
  @IsNumberString()
  idMedico: string

  @ApiProperty({
    description: 'Clave foránea que referencia a los pacientes',
    example: '3',
  })
  @IsNotEmpty()
  @IsNumberString()
  idPaciente: string
}
