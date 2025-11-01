import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateIf,
} from '@/common/validation'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import {
  AntecedenteEstadoRegistro,
  AntecedenteFuenteDatos,
} from '../constants/antecedentes.constants'
import { ArchivoAdjuntoDto } from './historia-clinica.dto'

export class CreateAntecedenteDto {
  // DATOS FAMILIARES
  @ApiPropertyOptional({ description: 'Antecedentes patológicos familiares' })
  @IsOptional()
  @IsString()
  antecedentesFamiliares?: string

  @ApiProperty({ description: '¿Tiene enfermedad diagnosticada?' })
  @IsBoolean()
  enfermedadDiagnosticada: boolean

  @ApiPropertyOptional({
    description: 'Descripción de la enfermedad diagnosticada',
  })
  @ValidateIf((dto) => dto.enfermedadDiagnosticada === true)
  @IsOptional()
  @IsString()
  descripcionEnfermedad?: string

  @ApiProperty({ description: '¿Sigue un tratamiento médico?' })
  @IsBoolean()
  sigueTratamiento: boolean

  @ApiPropertyOptional({ description: 'Descripción del tratamiento actual' })
  @ValidateIf((dto) => dto.sigueTratamiento === true)
  @IsOptional()
  @IsString()
  descripcionTratamiento?: string

  @ApiProperty({ description: '¿Se le ha practicado alguna cirugía?' })
  @IsBoolean()
  tieneCirugia: boolean

  @ApiPropertyOptional({ description: 'Descripción de la cirugía realizada' })
  @ValidateIf((dto) => dto.tieneCirugia === true)
  @IsOptional()
  @IsString()
  descripcionCirugia?: string

  // DATOS GASTROINTESTINALES
  @ApiProperty({ description: '¿Tiene estreñimiento?' })
  @IsBoolean()
  tieneEstrenimiento: boolean

  @ApiProperty({ description: '¿Tiene diarrea?' })
  @IsBoolean()
  tieneDiarrea: boolean

  @ApiProperty({ description: '¿Tiene náuseas?' })
  @IsBoolean()
  tieneNauseas: boolean

  @ApiProperty({ description: '¿Tiene vómitos?' })
  @IsBoolean()
  tieneVomitos: boolean

  @ApiPropertyOptional({ description: 'Frecuencia de evacuación' })
  @IsOptional()
  @IsString()
  frecuenciaEvacuacion?: string

  @ApiPropertyOptional({ description: 'Tipo de deposición' })
  @IsOptional()
  @IsString()
  tipoDeposicion?: string

  // ALERGIAS E INTOLERANCIAS
  @ApiPropertyOptional({ description: 'Alergias conocidas' })
  @IsOptional()
  @IsString()
  alergias?: string

  @ApiPropertyOptional({ description: 'Intolerancias alimentarias' })
  @IsOptional()
  @IsString()
  intolerancias?: string

  // DATOS GINECOLÓGICOS
  @ApiPropertyOptional({
    description: 'Fecha de última menstruación',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  fechaUltimaMenstruacion?: string

  @ApiPropertyOptional({ description: '¿Menstruación regular?' })
  @IsOptional()
  @IsBoolean()
  menstruacionRegular?: boolean

  @ApiPropertyOptional({ description: 'Método anticonceptivo utilizado' })
  @IsOptional()
  @IsString()
  metodoAnticonceptivo?: string

  @ApiPropertyOptional({ description: '¿Presenta cólicos?' })
  @IsOptional()
  @IsBoolean()
  colicos?: boolean

  // DIETAS ANTERIORES
  @ApiPropertyOptional({
    description: 'Dietas anteriores, tipos y resultados logrados',
  })
  @IsOptional()
  @IsString()
  dietasAnteriores?: string

  @ApiPropertyOptional({
    description: 'Estado actual del registro de antecedentes',
    enum: AntecedenteEstadoRegistro,
    default: AntecedenteEstadoRegistro.BORRADOR,
  })
  @IsOptional()
  @IsEnum(AntecedenteEstadoRegistro)
  estadoRegistro?: AntecedenteEstadoRegistro

  @ApiPropertyOptional({ description: 'Motivo asociado a la actualización' })
  @IsOptional()
  @IsString()
  motivoActualizacion?: string

  @ApiPropertyOptional({
    description:
      'Identificador de la evaluación nutricional que origina el cambio',
  })
  @IsOptional()
  @IsNumberString()
  idEvaluacionNutricionalOrigen?: string

  @ApiPropertyOptional({
    description: 'Fuente de los datos capturados',
    enum: AntecedenteFuenteDatos,
    default: AntecedenteFuenteDatos.PROFESIONAL,
  })
  @IsOptional()
  @IsEnum(AntecedenteFuenteDatos)
  fuenteDatos?: AntecedenteFuenteDatos

  @ApiPropertyOptional({
    description: 'Archivos adjuntos asociados al antecedente',
    type: [ArchivoAdjuntoDto],
  })
  @IsOptional()
  archivos?: ArchivoAdjuntoDto[]
}

export class UpdateAntecedenteDto extends PartialType(CreateAntecedenteDto) {}

export class CerrarAntecedenteDto {
  @ApiPropertyOptional({
    description: 'Motivo de cierre o actualización final',
  })
  @IsOptional()
  @IsString()
  motivoActualizacion?: string

  @ApiPropertyOptional({
    description:
      'Identificador de la evaluación nutricional que origina el cierre',
  })
  @IsOptional()
  @IsNumberString()
  idEvaluacionNutricionalOrigen?: string

  @ApiPropertyOptional({
    description: 'Fuente de los datos que respaldan el cierre',
    enum: AntecedenteFuenteDatos,
  })
  @IsOptional()
  @IsEnum(AntecedenteFuenteDatos)
  fuenteDatos?: AntecedenteFuenteDatos
}
