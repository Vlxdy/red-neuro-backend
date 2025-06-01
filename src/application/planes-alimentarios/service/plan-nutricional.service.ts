import { AsignacionRepository } from '@/application/gestion-pacientes/repositories/asignacion.repository'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import {
  ActualizarPlanNutricionalDto,
  CrearPlanNutricionalDto,
} from '../dto/plan-nutricional.dto'
import { AlimentoPlanNutricional } from '../entity/alimento-plan-nutricional.entity'
import { PlanNutricional } from '../entity/plan-nutricional.entity'
import { AlimentoPlanNutricionalRepository } from '../repository/alimento-plan-nutricional.repository'
import { PlanNutricionalRepository } from '../repository/plan-nutricional.repository'
import { AlimentoService } from './alimento.service'

@Injectable()
export class PlanNutricionalService {
  constructor(
    private readonly repository: PlanNutricionalRepository,
    private readonly alimentoPlanNutricionalRepository: AlimentoPlanNutricionalRepository,
    private readonly asignacionRepository: AsignacionRepository,
    private readonly alimentosService: AlimentoService
  ) {}

  async crear(
    data: CrearPlanNutricionalDto,
    usuario: string,
    transaccion?: EntityManager
  ) {
    //NOTE: Cambiar por el idPaciente (tabla asignacion)
    const paciente =
      await this.asignacionRepository.buscarPacientePorIdUsuarioRol(
        data.idUsuarioRol
      )

    if (!paciente) throw new NotFoundException('Paciente no encontrado')

    const plan = new PlanNutricional()
    plan.idPaciente = paciente.id
    plan.fecha = data.fecha
    plan.usuarioCreacion = usuario
    // plan.plan = data.alimentos

    const nuevoPlan = await this.repository.crear(plan, transaccion)

    const promises = data.alimentos.map(async (alimento) => {
      const alimentoExiste = await this.alimentosService.buscarPorId(
        alimento.idAlimento
      )

      if (!alimentoExiste) {
        throw new NotFoundException('Alimento no encontrado')
      }

      const alimentoPlanNutricional = new AlimentoPlanNutricional()
      alimentoPlanNutricional.idPlanNutricional = nuevoPlan.id
      alimentoPlanNutricional.idAlimento = alimento.idAlimento
      alimentoPlanNutricional.cantidad = alimento.cantidad
      alimentoPlanNutricional.usuarioCreacion = usuario
      alimentoPlanNutricional.tipo = alimento.tipo

      return await this.alimentoPlanNutricionalRepository.crear(
        alimentoPlanNutricional,
        transaccion
      )
    })

    await Promise.all(promises)

    return { id: nuevoPlan.id }
  }

  async crearMultiple(data: CrearPlanNutricionalDto[], usuario: string) {
    const op = async (transaccion: EntityManager) => {
      const promises = data.map(async (plan) => {
        return await this.crear(plan, usuario, transaccion)
      })
      const respuesta = await Promise.all(promises)
      return { creados: respuesta.length }
    }

    return await this.repository.runTransaction(op)
  }

  async actualizar(
    id: string,
    data: ActualizarPlanNutricionalDto,
    usuario: string
  ) {
    const plan = await this.repository.buscarPorId(id)
    if (!plan) throw new NotFoundException('Plan nutricional no encontrado')

    const alimentosPlanNutricional =
      await this.alimentoPlanNutricionalRepository.listarPorIdPlanNutricional(
        id
      )

    const promises = alimentosPlanNutricional.map(async (apn) => {
      return await this.alimentoPlanNutricionalRepository.inactivar(
        apn.id,
        usuario
      )
    })
    await Promise.all(promises)

    const promesas = data.alimentos.map(async (alimento) => {
      const alimentoExiste = await this.alimentosService.buscarPorId(
        alimento.idAlimento
      )

      if (!alimentoExiste) {
        throw new NotFoundException('Alimento no encontrado')
      }

      const alimentoPlanNutricional = new AlimentoPlanNutricional()
      alimentoPlanNutricional.idPlanNutricional = id
      alimentoPlanNutricional.idAlimento = alimento.idAlimento
      alimentoPlanNutricional.cantidad = alimento.cantidad
      alimentoPlanNutricional.usuarioCreacion = usuario
      alimentoPlanNutricional.tipo = alimento.tipo

      return await this.alimentoPlanNutricionalRepository.crear(
        alimentoPlanNutricional
      )
    })
    await Promise.all(promesas)

    return { mensaje: 'Plan nutricional actualizado correctamente' }
  }

  async inactivar(id: string, usuario: string) {
    const plan = await this.repository.buscarPorId(id)
    if (!plan) throw new NotFoundException('Plan nutricional no encontrado')

    await this.repository.inactivar(id, usuario)
    return { mensaje: 'Plan nutricional inactivado correctamente' }
  }

  async buscarPorId(id: string) {
    const plan = await this.repository.buscarPorId(id)
    if (!plan) throw new NotFoundException('Plan nutricional no encontrado')
    return plan
  }
  async buscarPorUsuarioRolYFecha(idUsuarioRol: string, fecha: string) {
    const paciente =
      await this.asignacionRepository.buscarPacientePorIdUsuarioRol(
        idUsuarioRol
      )
    if (!paciente) throw new NotFoundException('Paciente no encontrado')

    const planNutricional = await this.repository.buscarPorPacienteYFecha(
      paciente.id,
      fecha
    )

    let planNutricionalDto
    if (planNutricional) {
      const alimentos = planNutricional.alimentosPlanNutricional.map((apn) => {
        return {
          id: apn.id,
          cantidad: apn.cantidad,
          estado: apn.estado,
          tipo: apn.tipo,
          nombre: apn.alimento.nombre,
          categoria: apn.alimento.categoria,
          unidadMedida: apn.alimento.unidadMedida,
          calorias: apn.alimento.calorias,
          cantidadReferencial: apn.alimento.cantidadReferencial,
          idAlimento: apn.alimento.id,
          urlImage: apn.alimento.urlImage,
          grasa: apn.alimento.grasa,
          carbohidratos: apn.alimento.carbohidratos,
          proteinas: apn.alimento.proteinas,
        }
      })
      planNutricionalDto = {
        id: planNutricional.id,
        fecha: planNutricional.fecha,
        alimentos,
      }
    }

    return {
      encontrado: !!planNutricional,
      planNutricional: planNutricionalDto,
    }
  }

  async listarTodos(paginacionQueryDto: PaginacionQueryDto) {
    return await this.repository.listarTodos(paginacionQueryDto)
  }

  async listarPorIdPaciente(
    idUsuarioRol: string,
    paginacionQueryDto: PaginacionQueryDto
  ): Promise<[any, number]> {
    //NOTE: Cambiar por el idPaciente
    const paciente =
      await this.asignacionRepository.buscarPacientePorIdUsuarioRol(
        idUsuarioRol
      )
    if (!paciente) throw new NotFoundException('Paciente no encontrado')
    const resultado = await this.repository.listarPorIdPaciente(
      paciente.id,
      paginacionQueryDto
    )

    const planesNutricionales = resultado[0].map((planNutricional) => {
      const alimentos = planNutricional.alimentosPlanNutricional.map((apn) => {
        return {
          id: apn.id,
          cantidad: apn.cantidad,
          estado: apn.estado,
          tipo: apn.tipo,
          nombre: apn.alimento.nombre,
          categoria: apn.alimento.categoria,
          unidadMedida: apn.alimento.unidadMedida,
          calorias: apn.alimento.calorias,
          cantidadReferencial: apn.alimento.cantidadReferencial,
          idAlimento: apn.alimento.id,
        }
      })

      return {
        id: planNutricional.id,
        fecha: planNutricional.fecha,
        alimentos: alimentos,
      }
    })

    return [planesNutricionales, resultado[1]]
  }
}
