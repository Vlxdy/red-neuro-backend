import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Messages } from '@/common/constants/response-messages'
import { PlanesAlimentariosRepository } from '../repository'
import { ActualizarPlanAlimentarioDto, CrearPlanAlimentarioDto } from '../dto'

@Injectable()
export class PlanesAlimentariosService extends BaseService {
  constructor(
    @Inject(PlanesAlimentariosRepository)
    private planesAlimentariosRepositorio: PlanesAlimentariosRepository
  ) {
    super()
  }

  async crear(parametroDto: CrearPlanAlimentarioDto, usuarioAuditoria: string) {
    return await this.planesAlimentariosRepositorio.crear(
      parametroDto,
      usuarioAuditoria
    )
  }

  async listar(paginacionQueryDto: PaginacionQueryDto) {
    return await this.planesAlimentariosRepositorio.listar(paginacionQueryDto)
  }

  async actualizarDatos(
    id: string,
    parametroDto: ActualizarPlanAlimentarioDto,
    usuarioAuditoria: string
  ) {
    const parametro = await this.planesAlimentariosRepositorio.buscarPorId(id)
    if (!parametro) {
      throw new NotFoundException(Messages.EXCEPTION_DEFAULT)
    }
    await this.planesAlimentariosRepositorio.actualizar(
      id,
      parametroDto,
      usuarioAuditoria
    )
    return { id }
  }
}
