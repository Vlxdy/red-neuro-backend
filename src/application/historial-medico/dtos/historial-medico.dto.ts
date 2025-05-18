import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'
import { Validate } from 'class-validator'

export class ArchivoAdjuntoDto {
  @ApiProperty({
    description: 'Nombre del archivo adjunto',
    example: 'examen_sangre.pdf',
  })
  @IsNotEmpty()
  @IsString()
  @Length(0, 1000)
  nombreArchivo: string

  @ApiProperty({
    description: 'Tipo de archivo adjunto (ejemplo: imagen, documento)',
    example: 'pdf',
  })
  @IsNotEmpty()
  @IsString()
  @Length(0, 15)
  tipoArchivo: string

  @ApiProperty({
    description: 'Contenido del archivo en formato base64',
    example: 'JVBERi0xLjQKJcfs...',
  })
  @IsNotEmpty()
  @IsString()
  @Length(0, 1000000)
  contenidoBase64: string // sin prefijo: solo el base64 puro
}

export class ExamenesSolicitadosDto {
  @ApiProperty({
    description: 'Nombre del examen solicitado',
    example: 'Análisis de sangre',
  })
  @IsNotEmpty()
  @IsString()
  @Length(0, 1000)
  nombreExamen: string

  @ApiProperty({
    description: 'Instrucciones para la realización del examen',
    example: 'Ayuno de 8 horas antes del examen',
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  instrucciones: string
}

export class CrearHistorialMedicoDto {
  @ApiProperty({
    description: 'Clave foránea que referencia al medico idRolUsuario',
    example: '2',
  })
  @IsNotEmpty()
  @IsNumberString()
  idPaciente: string

  @ApiProperty({
    description: 'Descripción de los sintomas del paciente',
    example: 'Dolor de cabeza y fiebre',
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  sintomas: string

  @ApiProperty({
    description: 'Resultados de la evaluación física del paciente',
    example: 'Presión arterial normal, temperatura elevada',
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  evaluacionFisica: string

  @ApiProperty({
    description: 'Motivo de la consulta',
    example: 'Consulta por dolor de cabeza',
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  motivoConsulta: string

  @ApiProperty({
    description: 'Observaciones adicionales del médico',
    example: 'Requiere seguimiento en una semana',
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  observaciones: string

  @ApiProperty({
    description: 'Lista de diagnósticos del paciente',
    example: ['Migraña', 'Fiebre'],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @Validate(IsString, { each: true })
  diagnosticos: Array<string>

  @ApiProperty({
    description: 'Lista de tratamientos recetados al paciente',
    example: ['Paracetamol', 'Ibuprofeno'],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @Validate(IsString, { each: true })
  tratamientos: Array<string>

  @ApiProperty({
    description: 'Lista de archivos adjuntos al historial médico',
    example: [
      {
        nombreArchivo: 'examen_sangre.pdf',
        tipoArchivo: 'pdf',
        contenidoBase64: 'JVBERi0xLjQKJcfs...',
      },
      {
        nombreArchivo: 'radiografia.jpg',
        tipoArchivo: 'jpg',
        contenidoBase64: 'iVBORw0KGgoAAAANSUhEUgAA...',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @Validate(ArchivoAdjuntoDto, { each: true })
  archivos: Array<ArchivoAdjuntoDto>

  @ApiProperty({
    description: 'Lista de examenes solicitados al paciente',
    example: [
      {
        nombreExamen: 'Análisis de sangre',
        instrucciones: 'Ayuno de 8 horas antes del examen',
      },
      {
        nombreExamen: 'Radiografía de tórax',
        instrucciones: 'No se requiere preparación especial',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @Validate(ExamenesSolicitadosDto, { each: true })
  examenes: Array<ExamenesSolicitadosDto>
}
