import { IsNotEmpty } from '@/common/validation'
import { ApiProperty } from '@nestjs/swagger'

export class SINCredencialesDTO {
  @ApiProperty()
  Nit: string

  @ApiProperty()
  @IsNotEmpty()
  Usuario: string

  @ApiProperty()
  @IsNotEmpty()
  Contrasena: string
}
