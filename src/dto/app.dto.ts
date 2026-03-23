import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, Matches } from '@/common/validation'

export class EstadoMobileQueryDto {
  @ApiProperty({
    required: false,
    enum: ['android', 'ios'],
    description: 'Plataforma de la aplicación móvil',
  })
  @IsOptional()
  @IsString()
  @IsIn(['android', 'ios'])
  platform?: 'android' | 'ios'

  @ApiProperty({
    required: false,
    example: '1.8.0',
    description: 'Versión semántica de la app móvil (major.minor.patch)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'La versión debe tener el formato major.minor.patch',
  })
  version?: string

  @ApiProperty({
    required: false,
    example: '104',
    description: 'Número de build de la app móvil',
  })
  @IsOptional()
  @IsString()
  build?: string
}

export class EstadoMobileDto {
  @ApiProperty({
    type: Boolean,
    example: true,
  })
  enabled: boolean

  @ApiProperty({
    required: false,
    nullable: true,
    enum: ['android', 'ios'],
    example: 'android',
  })
  platform?: 'android' | 'ios' | null

  @ApiProperty({
    required: false,
    nullable: true,
    example: '1.8.0',
  })
  currentVersion?: string | null

  @ApiProperty({
    required: false,
    nullable: true,
    example: '104',
  })
  currentBuild?: string | null

  @ApiProperty({
    required: false,
    nullable: true,
    example: '1.8.0',
  })
  minVersion?: string | null

  @ApiProperty({
    required: false,
    nullable: true,
    example: '1.9.3',
  })
  stableVersion?: string | null

  @ApiProperty({
    required: false,
    nullable: true,
    enum: ['required', 'recommended', 'ok'],
    example: 'recommended',
  })
  status?: 'required' | 'recommended' | 'ok' | null

  @ApiProperty({
    required: false,
    nullable: true,
    type: Boolean,
    example: false,
  })
  forceUpdate?: boolean | null

  @ApiProperty({
    required: false,
    nullable: true,
    type: Boolean,
    example: true,
  })
  shouldUpdate?: boolean | null

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'https://play.google.com/store/apps/details?id=bo.redneuro.app',
  })
  storeUrl?: string | null

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Nueva versión disponible',
  })
  title?: string | null

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Te recomendamos actualizar a la versión más estable.',
  })
  message?: string | null
}

export class EstadoDto {
  @ApiProperty({
    type: String,
    example: 'redneuro-backend',
  })
  servicio: string

  @ApiProperty({
    type: String,
    example: '1.12.0',
  })
  version: string

  @ApiProperty({
    type: String,
    example: 'development',
  })
  entorno: string

  @ApiProperty({
    type: String,
    example: 'Activo',
  })
  estado: string

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
  })
  commit_sha: string | null

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
  })
  mensaje: string | null

  @ApiProperty({
    type: String,
    nullable: true,
    example: null,
  })
  branch: string | null

  @ApiProperty({
    type: String,
    example: '2025-11-28 12:04:12.954',
  })
  fecha: string

  @ApiProperty({
    type: Number,
    example: 1711826427027,
  })
  hora: number

  @ApiProperty({
    type: EstadoMobileDto,
    required: false,
    nullable: true,
  })
  mobile?: EstadoMobileDto | null
}
