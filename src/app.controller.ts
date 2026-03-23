import { Controller, Get, Inject, Query } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseController } from '@/common/base'
import packageJson from '../package.json'
import dayjs from 'dayjs'
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { ApiBaseResponse } from './common/decorators/api-base-responde.decorator'
import { EstadoDto, EstadoMobileQueryDto } from './dto/app.dto'
import { BaseResponseDto } from './common/dto/swagger/base-response.dto'
import { MobileVersionService } from './mobile-version/mobile-version.service'

@Controller()
@ApiTags('Estado')
export class AppController extends BaseController {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    private readonly mobileVersionService: MobileVersionService
  ) {
    super()
  }

  @ApiOperation({ summary: 'API para obtener el estado de la aplicación' })
  @ApiQuery({ name: 'platform', required: false, enum: ['android', 'ios'] })
  @ApiQuery({ name: 'version', required: false, example: '1.8.0' })
  @ApiQuery({ name: 'build', required: false, example: '104' })
  @ApiBaseResponse(EstadoDto)
  @Get('/estado')
  verificarEstado(
    @Query() query: EstadoMobileQueryDto
  ): BaseResponseDto<EstadoDto> {
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
      mobile: this.mobileVersionService.evaluarVersion(
        query.platform,
        query.version,
        query.build
      ),
    }
    return this.success(estado)
  }
}
