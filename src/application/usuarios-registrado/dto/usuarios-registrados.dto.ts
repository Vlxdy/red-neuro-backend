import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
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

export interface UsuariosRegistradosResponse {
  id: string
  nombres: string
  primerApellido?: string | null
  segundoApellido?: string | null
  nroDocumento: string
  tipoDocumento: string
  genero?: string | null
  correoElectronico?: string | null
  estado: string
  // especialidad: string
}

export interface PacientesAsignadosDto extends PaginacionQueryDto {
  todos?: boolean
}
