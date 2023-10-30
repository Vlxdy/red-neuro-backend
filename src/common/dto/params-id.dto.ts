import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString } from '../validation'

export class ParamIdDto {
  @ApiProperty({ example: '12', name: 'id' })
  @IsNumberString()
  id: string
}
