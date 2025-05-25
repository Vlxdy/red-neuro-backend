import { BaseController } from '@/common/base'
import { PaginacionAlimentosQueryDto } from '@/common/dto/paginacion-query.dto'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AlimentoService } from '../service/alimento.service'

@Controller('alimentos')
@UseGuards(JwtAuthGuard)
export class AlimentoController extends BaseController {
  constructor(private readonly service: AlimentoService) {
    super()
  }

  @Get()
  async listarTodos(@Query() paginacion: PaginacionAlimentosQueryDto) {
    const resultado = await this.service.listarTodos(paginacion)
    return this.successListRows(resultado)
  }
}
