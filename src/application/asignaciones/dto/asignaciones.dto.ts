import { IsNotEmpty, IsNumberString } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class CrearAsignacionDto {
  @ApiProperty({
    description: 'Clave foránea que referencia al medico idRolUsuario',
    example: '2',
  })
  @IsNotEmpty()
  @IsNumberString()
  idMedico: string

  @ApiProperty({
    description: 'Clave foránea que referencia al paciente idRolUsuario',
    example: '3',
  })
  @IsNotEmpty()
  @IsNumberString()
  idPaciente: string
}
