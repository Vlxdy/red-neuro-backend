import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from '@/common/validation'

export class EnviarMensajeDto {
  @IsEmail()
  para: string

  @IsString()
  @IsNotEmpty()
  asunto: string

  @IsString()
  @IsNotEmpty()
  mensaje: string

  @IsArray()
  @IsOptional()
  adjuntos?: AdjuntoCorreoDto[]
}

export class AdjuntoCorreoDto {
  @IsString()
  @IsNotEmpty()
  filename: string

  @IsString()
  @IsNotEmpty()
  path: string

  @IsString()
  @IsNotEmpty()
  cid: string
}
