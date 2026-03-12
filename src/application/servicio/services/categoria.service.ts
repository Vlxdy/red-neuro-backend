import { BaseService } from '@/common/base'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CategoriaRepository } from '../repository/categoria.repository'
import {
  ActualizarCategoriaDto,
  CategoriaResponseDto,
  CrearCategoriaDto,
  ListarCategoriasQueryDto,
} from '../dto/categoria.dto'
import {
  formatearCategoria,
  formatearCategorias,
} from '../utils/formateo.categoria'
import { EntityManager } from 'typeorm'
import { Messages } from '@/common/constants/response-messages'
import { ServicioEstado } from '../constants'

@Injectable()
export class CategoriaService extends BaseService {
  constructor(
    @Inject(CategoriaRepository)
    private readonly categoriaRepository: CategoriaRepository
  ) {
    super()
  }

  async listarCategorias(
    paginacionQuery: ListarCategoriasQueryDto
  ): Promise<[CategoriaResponseDto[], number]> {
    const [categorias, total] =
      await this.categoriaRepository.listarCategoriasPaginado(paginacionQuery)
    return [formatearCategorias(categorias), total]
  }

  async obtenerCategoriaPorId(id: string, transaccion?: EntityManager) {
    const categoria = await this.categoriaRepository.obtenerCategoriaPorId(
      id,
      transaccion
    )

    if (!categoria) {
      throw new NotFoundException(Messages.CATEGORIA_NOT_FOUND)
    }

    return categoria
  }

  async crearCategoria(
    dto: CrearCategoriaDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<CategoriaResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) =>
        await this.crearCategoria(dto, usuarioAuditoria, nuevaTransaccion)
      return await this.categoriaRepository.runTransaction(op)
    }

    const categoria = await this.categoriaRepository.crearCategoria(
      dto,
      usuarioAuditoria,
      transaccion
    )

    return formatearCategoria(categoria)
  }

  async actualizarCategoria(
    id: string,
    dto: ActualizarCategoriaDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<CategoriaResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) =>
        await this.actualizarCategoria(
          id,
          dto,
          usuarioAuditoria,
          nuevaTransaccion
        )
      return await this.categoriaRepository.runTransaction(op)
    }

    const categoria = await this.obtenerCategoriaPorId(id, transaccion)
    const actualizada = await this.categoriaRepository.actualizarCategoria(
      categoria,
      dto,
      usuarioAuditoria,
      transaccion
    )

    return formatearCategoria(actualizada)
  }

  async cambiarEstadoCategoria(
    id: string,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<CategoriaResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) =>
        await this.cambiarEstadoCategoria(
          id,
          usuarioAuditoria,
          nuevaTransaccion
        )
      return await this.categoriaRepository.runTransaction(op)
    }

    const categoria = await this.obtenerCategoriaPorId(id, transaccion)

    const actualizada = await this.categoriaRepository.actualizarCategoria(
      categoria,
      {
        estado:
          categoria.estado === ServicioEstado.ACTIVO
            ? ServicioEstado.INACTIVO
            : ServicioEstado.ACTIVO,
      },
      usuarioAuditoria,
      transaccion
    )

    return formatearCategoria(actualizada)
  }
}
