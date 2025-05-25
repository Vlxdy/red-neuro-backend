import { AsignacionRepository } from '@/application/gestion-pacientes/repositories/asignacion.repository'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CrearPlanNutricionalDto } from '../dto/plan-nutricional.dto'
import { PlanNutricional } from '../entity/plan-nutricional.entity'
import { PlanNutricionalRepository } from '../repository/plan-nutricional.repository'
import { AlimentoService } from './alimento.service'

@Injectable()
export class PlanNutricionalService {
  constructor(
    private readonly repository: PlanNutricionalRepository,
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
    plan.plan = data.alimentos
    plan.usuarioCreacion = usuario

    return await this.repository.crear(plan, transaccion)
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
    data: Partial<CrearPlanNutricionalDto>,
    usuario: string
  ) {
    const plan = await this.repository.buscarPorId(id)
    if (!plan) throw new NotFoundException('Plan nutricional no encontrado')

    await this.repository.actualizar(id, { plan: data.alimentos }, usuario)
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

    const promises = resultado[0].map(async (planNutricional) => {
      const existePlanes = planNutricional.plan.length > 0
      const alimentos = existePlanes
        ? await this.alimentosService.listarPorIds(planNutricional.plan)
        : []
      return {
        id: planNutricional.id,
        fecha: planNutricional.fecha,
        alimentos: alimentos,
        recomendaciones: planNutricional.recomendaciones,
      }
    })

    const result = await Promise.all(promises)

    return [result, resultado[1]]
  }
}
