import { BaseService } from '../../common/base/base-service'
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ParametroRepository } from './parametro.repository'
import { CrearParametroDto } from './dto/crear-parametro.dto'
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto'
import { Messages } from '../../common/constants/response-messages'
import { ActualizarParametroDto } from './dto/actualizar-parametro.dto'
import { Status } from '../../common/constants'

@Injectable()
export class ParametroService extends BaseService {
  constructor(
    @Inject(ParametroRepository)
    private parametroRepositorio: ParametroRepository
  ) {
    super()
  }

  async crear(parametroDto: CrearParametroDto, usuarioAuditoria: string) {
    const parametroRepetido = await this.parametroRepositorio.buscarCodigo(
      parametroDto.codigo
    )

    if (parametroRepetido) {
      throw new ConflictException(Messages.REPEATED_PARAMETER)
    }

    return await this.parametroRepositorio.crear(parametroDto, usuarioAuditoria)
  }

  async listar(paginacionQueryDto: PaginacionQueryDto) {
    return await this.parametroRepositorio.listar(paginacionQueryDto)
  }

  async listarPorGrupo(grupo: string) {
    return await this.parametroRepositorio.listarPorGrupo(grupo)
  }

  async actualizarDatos(
    id: string,
    parametroDto: ActualizarParametroDto,
    usuarioAuditoria: string
  ) {
    const parametro = await this.parametroRepositorio.buscarPorId(id)
    if (!parametro) {
      throw new NotFoundException(Messages.EXCEPTION_DEFAULT)
    }
    await this.parametroRepositorio.actualizar(
      id,
      parametroDto,
      usuarioAuditoria
    )
    return { id }
  }

  async activar(idParametro: string, usuarioAuditoria: string) {
    const parametro = await this.parametroRepositorio.buscarPorId(idParametro)
    if (!parametro) {
      throw new NotFoundException(Messages.EXCEPTION_DEFAULT)
    }
    const parametroDto = new ActualizarParametroDto()
    parametroDto.estado = Status.ACTIVE
    await this.parametroRepositorio.actualizar(
      idParametro,
      parametroDto,
      usuarioAuditoria
    )
    return {
      id: idParametro,
      estado: parametroDto.estado,
    }
  }

  async inactivar(idParametro: string, usuarioAuditoria: string) {
    const parametro = await this.parametroRepositorio.buscarPorId(idParametro)
    if (!parametro) {
      throw new NotFoundException(Messages.EXCEPTION_DEFAULT)
    }
    const parametroDto = new ActualizarParametroDto()
    parametroDto.estado = Status.INACTIVE
    await this.parametroRepositorio.actualizar(
      idParametro,
      parametroDto,
      usuarioAuditoria
    )
    return {
      id: idParametro,
      estado: parametroDto.estado,
    }
  }
}
