import {
  IsDateString,
  IsNotEmpty,
  IsNumberString,
  IsString,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class CrearCitaDto {
  // @ApiProperty({
  //   description: 'Clave foránea que referencia al medico idRolUsuario',
  //   example: '2',
  // })
  // @IsNotEmpty()
  // @IsNumberString()
  // idMedico: string

  @ApiProperty({
    description: 'Clave foránea que referencia al paciente idRolUsuario',
    example: '3',
  })
  @IsNotEmpty()
  @IsNumberString()
  idPaciente: string

  @ApiProperty({
    example: '2023-10-01T10:00:00Z',
    description: 'Fecha y hora de inicio de la cita',
  })
  @IsNotEmpty()
  @IsDateString()
  fechaInicio: Date

  @ApiProperty({
    description: 'Fecha y hora de fin de la cita',
    example: '2023-10-01T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  fechaFin: Date

  @ApiProperty({
    description: 'Descripción de la cita',
    example: 'Consulta médica general',
  })
  @IsNotEmpty()
  @IsString()
  detalle: string
}
