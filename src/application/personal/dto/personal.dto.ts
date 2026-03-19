import { ApiProperty } from '@nestjs/swagger'
import { RolEnum } from '@/core/authorization/rol.enum'

export class PersonalResponseDto {
  @ApiProperty({
    description: 'Identificador del usuario asociado al personal de salud',
    example: 'a8f4c1d2-32a1-4c2b-bff1-87fa92c1a223',
  })
  id!: string

  @ApiProperty({
    description: 'Estado del personal de salud en su rol',
    example: 'ACTIVO',
  })
  estado!: string

  @ApiProperty({
    description: 'Roles operativos asignados al personal de salud',
    example: [RolEnum.PERSONAL, RolEnum.COORDINADOR],
    enum: RolEnum,
    isArray: true,
    required: false,
  })
  roles?: RolEnum[]

  @ApiProperty({
    description: 'Número de documento de identidad',
    example: '4192299',
    required: false,
  })
  nroDocumento?: string

  @ApiProperty({
    description: 'Nombres del profesional de salud',
    example: 'Mariela',
  })
  nombres!: string

  @ApiProperty({
    description: 'Primer apellido del profesional',
    example: 'Alcázar',
    required: false,
  })
  primerApellido?: string | null

  @ApiProperty({
    description: 'Segundo apellido del profesional',
    example: 'Almaraz',
    required: false,
  })
  segundoApellido?: string | null

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '2002-05-04',
    required: false,
  })
  fechaNacimiento?: string | null

  @ApiProperty({
    description: 'Número de teléfono de contacto',
    example: '71234567',
    required: false,
  })
  telefono?: string | null

  @ApiProperty({
    description: 'Correo electrónico institucional o personal',
    example: 'mariela.alcazar@clinica.com',
    required: false,
  })
  correoElectronico?: string | null

  @ApiProperty({
    description: 'Género',
    example: 'F',
    required: false,
  })
  genero?: string | null

  @ApiProperty({
    description: 'URL de la fotografía del profesional',
    example: '/fotos/mariela.jpg',
    required: false,
  })
  urlFoto?: string | null

  @ApiProperty({
    description: 'Ocupación del profesional',
    example: 'Cardiología',
    required: false,
  })
  ocupacion?: string | null
}
