import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/base'
import { BaseResponseListRowsDto } from '@/common/dto/swagger/base-response.dto'
import { ApiBaseResponseListRows } from '@/common/decorators/api-base-responde.decorator'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { PersonalResponseDto } from '../dto/personal.dto'
import { PersonalMedicoService } from '../services/personal-medico.service'

@Controller('personal-medico')
@ApiTags('Personal Médico')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class PersonalMedicoController extends BaseController {
  constructor(private readonly personalMedicoService: PersonalMedicoService) {
    super()
  }

  @ApiOperation({
    summary: 'Lista el personal de salud registrado',
  })
  @ApiBaseResponseListRows(PersonalResponseDto)
  @Get()
  async listar(
    @Query() paginacionQuery: PaginacionQueryDto
  ): Promise<BaseResponseListRowsDto<PersonalResponseDto>> {
    const resultado =
      await this.personalMedicoService.listarPersonalMedico(paginacionQuery)
    return this.successListRows(resultado)
  }
}
