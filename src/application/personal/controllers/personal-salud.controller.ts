import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseController } from '@/common/base'
import {
  BaseResponseDto,
  BaseResponseListRowsDto,
} from '@/common/dto/swagger/base-response.dto'
import { JwtAuthGuard } from '@/core/authentication/guards/jwt-auth.guard'
import {
  ApiBaseResponse,
  ApiBaseResponseListRows,
} from '@/common/decorators/api-base-responde.decorator'
import { CasbinGuard } from '@/core/authorization/guards/casbin.guard'
import { ParamIdDto } from '@/common/dto/params-id.dto'
import { Request } from 'express'
import { PersonalSaludService } from '../services/personal-salud.service'
import {
  ActualizarPersonalSaludDto,
  CrearPersonalSaludDto,
} from '../dto/personal-salud.dto'
import { PersonalResponseDto } from '../dto/personal.dto'
import { ListarPersonalSaludQueryDto } from '../dto/listar-personal-salud-query.dto'

@Controller('personal-salud')
@ApiTags('Personal Salud')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CasbinGuard)
export class PersonalSaludController extends BaseController {
  constructor(private readonly personalSaludService: PersonalSaludService) {
    super()
  }

  @ApiOperation({ summary: 'Lista el personal de salud registrado' })
  @ApiBaseResponseListRows(PersonalResponseDto)
  @Get()
  async listar(
    @Req() req: Request,
    @Query() paginacionQuery: ListarPersonalSaludQueryDto
  ): Promise<BaseResponseListRowsDto<PersonalResponseDto>> {
    if (!req.user) {
      throw new ForbiddenException()
    }

    const resultado = await this.personalSaludService.listarPersonalSalud(
      paginacionQuery,
      {
        rol: req.user.rol,
        roles: req.user.roles,
        esSupervisor: req.user.esSupervisor,
      }
    )
    return this.successListRows(resultado)
  }

  @ApiOperation({ summary: 'Obtiene el detalle de un profesional de salud' })
  @ApiBaseResponse(PersonalResponseDto)
  @Get(':id')
  async obtenerPorId(
    @Param() { id }: ParamIdDto
  ): Promise<BaseResponseDto<PersonalResponseDto>> {
    const resultado =
      await this.personalSaludService.obtenerPersonalSaludPorId(id)
    return this.success(resultado)
  }

  @ApiOperation({ summary: 'Crea un nuevo profesional de salud' })
  @ApiBaseResponse(PersonalResponseDto)
  @Post()
  async crear(
    @Req() req: Request,
    @Body() dto: CrearPersonalSaludDto
  ): Promise<BaseResponseDto<PersonalResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.personalSaludService.crearPersonalSalud(
      dto,
      usuarioAuditoria,
      {
        rol: req.user?.rol,
        roles: req.user?.roles,
        esSupervisor: req.user?.esSupervisor,
      }
    )
    return this.successCreate(resultado)
  }

  @ApiOperation({ summary: 'Actualiza la información del personal de salud' })
  @ApiBaseResponse(PersonalResponseDto)
  @Patch(':id')
  async actualizar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request,
    @Body() dto: ActualizarPersonalSaludDto
  ): Promise<BaseResponseDto<PersonalResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.personalSaludService.actualizarPersonalSalud(
      id,
      dto,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Activa un profesional de salud' })
  @ApiBaseResponse(PersonalResponseDto)
  @Patch(':id/activacion')
  async activar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<PersonalResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.personalSaludService.activarPersonalSalud(
      id,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({ summary: 'Inactiva un profesional de salud' })
  @ApiBaseResponse(PersonalResponseDto)
  @Patch(':id/inactivacion')
  async inactivar(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ): Promise<BaseResponseDto<PersonalResponseDto>> {
    const usuarioAuditoria = this.getUser(req)
    const resultado = await this.personalSaludService.inactivarPersonalSalud(
      id,
      usuarioAuditoria
    )
    return this.successUpdate(resultado)
  }

  @ApiOperation({
    summary:
      'Restablece la contraseña del profesional de salud y la envía por correo',
  })
  @Patch(':id/restauracion-contrasena')
  async restablecerContrasena(
    @Param() { id }: ParamIdDto,
    @Req() req: Request
  ) {
    const usuarioAuditoria = this.getUser(req)
    const resultado =
      await this.personalSaludService.restablecerContrasenaPersonalSalud(
        id,
        usuarioAuditoria,
        {
          rol: req.user?.rol,
          roles: req.user?.roles,
          esSupervisor: req.user?.esSupervisor,
        }
      )

    return this.successUpdate(resultado)
  }
}
