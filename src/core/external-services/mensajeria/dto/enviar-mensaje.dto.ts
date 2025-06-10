import { IsEmail, IsNotEmpty, IsString } from '@/common/validation'

export class EnviarMensajeDto {
  @IsEmail()
  para: string

  @IsString()
  @IsNotEmpty()
  asunto: string

  @IsString()
  @IsNotEmpty()
  mensaje: string
}
