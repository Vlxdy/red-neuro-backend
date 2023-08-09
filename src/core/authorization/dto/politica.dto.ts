import { IsNotEmpty } from 'class-validator'

export class PoliticaDto {
  @IsNotEmpty()
  sujeto: string

  @IsNotEmpty()
  objeto: string

  @IsNotEmpty()
  accion: string

  @IsNotEmpty()
  app: string
}
