import { AsignacionRepository } from '@/application/gestion-pacientes/repositories/asignacion.repository'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CrearCarritoCompraDto } from '../dto/carrito-compra.dto'
import { CarritoCompra } from '../entity/carrito-compra.entity'
import { CarritoCompraRepository } from '../repository/carrito-compra.repository'

@Injectable()
export class CarritoCompraService {
  constructor(
    private readonly repository: CarritoCompraRepository,
    private readonly asignacionRepository: AsignacionRepository
  ) {}

  async crear(
    data: CrearCarritoCompraDto,
    usuario: string,
    transaccion?: EntityManager
  ) {
    const paciente =
      await this.asignacionRepository.buscarPacientePorIdUsuarioRol(
        data.idUsuarioRol
      )

    if (!paciente) throw new NotFoundException('Paciente no encontrado')

    const carrito = new CarritoCompra()
    carrito.idPaciente = paciente.id
    carrito.nombre = data.nombre
    carrito.productos = []
    carrito.usuarioCreacion = usuario

    return await this.repository.crear(carrito, transaccion)
  }

  async actualizar(id: string, data: Partial<CarritoCompra>, usuario: string) {
    const carrito = await this.repository.buscarPorId(id)
    if (!carrito) throw new NotFoundException('Carrito compras no encontrado')

    await this.repository.actualizar(id, { productos: data.productos }, usuario)
    return { mensaje: 'Carrito compras actualizado correctamente' }
  }

  async inactivar(id: string, usuario: string) {
    const carrito = await this.repository.buscarPorId(id)
    if (!carrito) throw new NotFoundException('Carrito compras no encontrado')

    await this.repository.inactivar(id, usuario)
    return { mensaje: 'Carrito compras inactivado correctamente' }
  }

  async buscarPorId(id: string) {
    const carrito = await this.repository.buscarPorId(id)
    if (!carrito) throw new NotFoundException('Carrito compras no encontrado')
    return carrito
  }

  async listarPorIdPaciente(
    idUsuarioRol: string,
    paginacionQueryDto: PaginacionQueryDto
  ): Promise<[any, number]> {
    const paciente =
      await this.asignacionRepository.buscarPacientePorIdUsuarioRol(
        idUsuarioRol
      )
    if (!paciente) throw new NotFoundException('Paciente no encontrado')

    const resultado = await this.repository.listarPorIdPaciente(
      paciente.id,
      paginacionQueryDto
    )

    return resultado
  }
}
