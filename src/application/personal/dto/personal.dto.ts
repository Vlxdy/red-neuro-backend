import { ApiProperty } from '@nestjs/swagger'

export class PersonalResponseDto {
  @ApiProperty({
    description: 'Identificador único del personal médico',
    example: 'a8f4c1d2-32a1-4c2b-bff1-87fa92c1a223',
  })
  id!: string

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
    description: 'Especialidades médicas del profesional',
    example: ['Pediatría', 'Neonatología'],
    required: false,
  })
  especialidades?: string[]
}
