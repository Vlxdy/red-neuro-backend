import { IsEnum, IsNotEmpty } from '@/common/validation'
import { RolEnum } from '@/core/authorization/rol.enum'
import { ApiProperty } from '@nestjs/swagger'

export class ListarUsuariosRegistradosDto {
  @ApiProperty({
    description: 'Rol de los usuarios',
    enum: RolEnum,
  })
  @IsNotEmpty()
  @IsEnum(RolEnum)
  rol: RolEnum
}
