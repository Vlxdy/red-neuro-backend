import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from '@/common/validation'

export class RegistrarDispositivoPushDto {
  @ApiProperty({ example: 'android' })
  @IsString()
  @IsNotEmpty()
  plataforma: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  versionApp?: string
}
