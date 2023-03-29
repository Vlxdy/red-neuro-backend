import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../authentication/guards/jwt-auth.guard'
import { BaseController } from '../../../common/base/base-controller'
import { AuthorizationService } from './authorization.service'
import { CasbinGuard } from '../guards/casbin.guard'
import { FiltrosPoliticasDto } from '../dto/filtros-politicas.dto'

@UseGuards(JwtAuthGuard, CasbinGuard)
@Controller('autorizacion')
export class AuthorizationController extends BaseController {
  constructor(private authorizationService: AuthorizationService) {
    super()
  }

  @Post('/politicas')
  async crearPolitica(@Body() politica) {
    const result = await this.authorizationService.crearPolitica(politica)
    return this.successCreate(result)
  }

  @Patch('/politicas')
  async actualizarPolitica(@Body() politica, @Query() query) {
    const result = await this.authorizationService.actualizarPolitica(
      query,
      politica
    )
    return this.successUpdate(result)
  }

  @Get('/politicas')
  async listarPoliticas(@Query() paginacionQueryDto: FiltrosPoliticasDto) {
    const result = await this.authorizationService.listarPoliticas(
      paginacionQueryDto
    )
    return this.successListRows(result)
  }

  @Delete('/politicas')
  async eliminarPolitica(@Query() query) {
    const result = await this.authorizationService.eliminarPolitica(query)
    return this.successDelete(result)
  }

  @Get('/permisos')
  async obtenerRoles() {
    const result = await this.authorizationService.obtenerRoles()
    return this.successList(result)
  }
}
