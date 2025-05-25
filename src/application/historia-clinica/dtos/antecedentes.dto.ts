import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
} from '@/common/validation'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

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
  @IsOptional()
  @IsString()
  descripcionEnfermedad?: string

  @ApiProperty({ description: '¿Sigue un tratamiento médico?' })
  @IsBoolean()
  sigueTratamiento: boolean

  @ApiPropertyOptional({ description: 'Descripción del tratamiento actual' })
  @IsOptional()
  @IsString()
  descripcionTratamiento?: string

  @ApiProperty({ description: '¿Se le ha practicado alguna cirugía?' })
  @IsBoolean()
  tieneCirugia: boolean

  @ApiPropertyOptional({ description: 'Descripción de la cirugía realizada' })
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
}
