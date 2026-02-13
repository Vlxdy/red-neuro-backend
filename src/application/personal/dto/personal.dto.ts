import { ApiProperty } from '@nestjs/swagger'

export class EspecialidadPersonalDto {
  @ApiProperty({
    description: 'Identificador único de la especialidad médica',
    example: '12',
  })
  id!: string

  @ApiProperty({
    description: 'Nombre visible de la especialidad médica',
    example: 'Cardiología',
  })
  nombre!: string

  @ApiProperty({
    description: 'Descripción opcional de la especialidad médica',
    example: 'Especialidad dedicada al diagnóstico de enfermedades cardíacas',
    required: false,
  })
  descripcion?: string

  @ApiProperty({ description: 'Estado del registro', example: 'ACTIVO' })
  estado!: string

  @ApiProperty({
    description: 'Color principal de la especialidad en formato hexadecimal',
    example: '#0ea5e9',
  })
  colorHex!: string
}

export class PersonalResponseDto {
  @ApiProperty({
    description: 'Identificador único del personal de salud',
    example: 'a8f4c1d2-32a1-4c2b-bff1-87fa92c1a223',
  })
  id!: string

  @ApiProperty({
    description: 'Estado del personal de salud en su rol',
    example: 'ACTIVO',
  })
  estado!: string
  @ApiProperty({
    description:
      'Indica si el personal de salud tiene habilitadas funciones de supervisión',
    example: false,
    required: false,
  })
  esSupervisor?: boolean

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
    type: [EspecialidadPersonalDto],
    example: [{ id: '1', nombre: 'Pediatría', colorHex: '#0ea5e9' }],
    required: false,
  })
  especialidades?: EspecialidadPersonalDto[]
}
