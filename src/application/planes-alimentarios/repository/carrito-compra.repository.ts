import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { CarritoComprasEstado } from '../constant'
import { CarritoCompra } from '../entity/carrito-compra.entity'

@Injectable()
export class CarritoCompraRepository {
  constructor(private dataSource: DataSource) {}

  async crear(carrito: CarritoCompra, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(CarritoCompra)
      .save(carrito)
  }

  async actualizar(id: string, data: Partial<CarritoCompra>, usuario: string) {
    const datosActualizar = new CarritoCompra({
      ...data,
      usuarioModificacion: usuario,
    })
    return await this.dataSource
      .getRepository(CarritoCompra)
      .update(id, datosActualizar)
  }

  async inactivar(id: string, usuario: string) {
    return await this.dataSource.getRepository(CarritoCompra).update(id, {
      estado: CarritoComprasEstado.INACTIVO,
      usuarioModificacion: usuario,
    })
  }

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(CarritoCompra)
      .createQueryBuilder('carrito')
      .where({ id })
      .getOne()
  }

  async listarPorIdPaciente(
    idPaciente: string,
    paginacionQueryDto: PaginacionQueryDto
  ) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQueryDto

    const query = this.dataSource
      .getRepository(CarritoCompra)
      .createQueryBuilder('carrito')
      .select([
        'carrito.id',
        'carrito.nombre',
        'carrito.productos',
        'carrito.estado',
        'carrito.fechaCreacion',
      ])
      .where('carrito.idPaciente = :idPaciente', { idPaciente })
      .andWhere('carrito.estado = :estado', {
        estado: CarritoComprasEstado.ACTIVO,
      })
      .take(limite)
      .skip(saltar)

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('carrito.recomendaciones ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('carrito.fecha ilike :filtro', { filtro: `%${filtro}%` })
        })
      )
    }

    switch (orden) {
      case 'estado':
        query.addOrderBy('carrito.estado', sentido)
        break
      default:
        query.addOrderBy('carrito.fechaCreacion', 'DESC')
    }

    return await query.getManyAndCount()
  }
}
