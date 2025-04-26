import { IsDateString, IsNotEmpty, IsNumber } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class CrearEvaluacionDto {
  // @ApiProperty({
  //   description: 'Clave foránea que referencia al paciente idRolUsuario',
  //   example: '3',
  // })
  // @IsNotEmpty()
  // @IsNumberString()
  // idCita: string

  @ApiProperty({
    example: '2023-10-01T10:00:00Z',
    description: 'Fecha y hora de inicio de la cita',
  })
  @IsNotEmpty()
  @IsDateString()
  fecha: Date

  @ApiProperty({
    description: 'Peso del paciente',
    example: 70,
  })
  @IsNumber()
  peso?: number

  @ApiProperty({
    description: 'Talla del paciente',
    example: 1.75,
  })
  talla?: number

  @ApiProperty({
    description: 'Indice de masa corporal del paciente',
    example: 22.86,
  })
  imc?: number

  diagnostico: string
}
