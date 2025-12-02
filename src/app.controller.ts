import { Controller, Get, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseController } from '@/common/base'
import packageJson from '../package.json'
import dayjs from 'dayjs'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiBaseResponse } from './common/decorators/api-base-responde.decorator'
import { EstadoDto } from './dto/app.dto'
import { BaseResponseDto } from './common/dto/swagger/base-response.dto'

@Controller()
@ApiTags('Estado')
export class AppController extends BaseController {
  constructor(@Inject(ConfigService) private configService: ConfigService) {
    super()
  }

  @ApiOperation({ summary: 'API para obtener el estado de la aplicación' })
  @ApiBaseResponse(EstadoDto)
  @Get('/estado')
  verificarEstado(): BaseResponseDto<EstadoDto> {
    const now = dayjs()

    const estado: EstadoDto = {
      servicio: packageJson.name,
      version: packageJson.version,
      entorno: this.configService.get('NODE_ENV') || '-',
      estado: 'Servicio funcionando correctamente',
      commit_sha: this.configService.get('CI_COMMIT_SHORT_SHA') || null,
      mensaje: this.configService.get('CI_COMMIT_MESSAGE') || null,
      branch: this.configService.get('CI_COMMIT_REF_NAME') || null,
      fecha: now.format('YYYY-MM-DD HH:mm:ss.SSS'),
      hora: now.valueOf(),
    }
    return this.success(estado)
  }
}
