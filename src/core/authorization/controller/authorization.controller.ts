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
import { BaseController } from '../../../common/base'
import { AuthorizationService } from './authorization.service'
import { CasbinGuard } from '../guards/casbin.guard'
import { FiltrosPoliticasDto } from '../dto/filtros-politicas.dto'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { PoliticaDto } from '../dto/politica.dto'

@ApiBearerAuth()
@ApiTags('Autorización')
@UseGuards(JwtAuthGuard, CasbinGuard)
@Controller('autorizacion')
export class AuthorizationController extends BaseController {
  constructor(private authorizationService: AuthorizationService) {
    super()
  }

  @ApiOperation({ summary: 'API para crear una nueva política' })
  @ApiBody({
    type: PoliticaDto,
    description: 'Crear nueva política',
    required: true,
  })
  @Post('/politicas')
  async crearPolitica(@Body() politica: PoliticaDto) {
    const result = await this.authorizationService.crearPolitica(politica)
    return this.successCreate(result)
  }

  @ApiOperation({ summary: 'API para actualizar una nueva política' })
  @ApiQuery({ name: 'id' })
  @ApiBody({
    type: PoliticaDto,
    description: 'Actualizar política',
    required: true,
  })
  @Patch('/politicas')
  async actualizarPolitica(
    @Body() politica: PoliticaDto,
    @Query() query: PoliticaDto
  ) {
    const result = await this.authorizationService.actualizarPolitica(
      query,
      politica
    )
    return this.successUpdate(result)
  }

  @ApiOperation({ summary: 'API para obtener el listado de politicas' })
  @ApiQuery({ name: 'query', type: FiltrosPoliticasDto })
  @Get('/politicas')
  async listarPoliticas(@Query() paginacionQueryDto: FiltrosPoliticasDto) {
    const result =
      await this.authorizationService.listarPoliticas(paginacionQueryDto)
    return this.successListRows(result)
  }

  @ApiOperation({ summary: 'API para eliminar una política' })
  @ApiQuery({ name: 'id' })
  @Delete('/politicas')
  async eliminarPolitica(@Query() query: PoliticaDto) {
    const result = await this.authorizationService.eliminarPolitica(query)
    return this.successDelete(result)
  }

  @ApiOperation({
    summary: 'API para obtener las politicas definidas en formato CASBIN',
  })
  @Get('/permisos')
  async obtenerRoles() {
    const result = await this.authorizationService.obtenerRoles()
    return this.successList(result)
  }
}
