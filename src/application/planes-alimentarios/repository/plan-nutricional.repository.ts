import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import {
  AlimentoPlanNutricionalEstado,
  PlanNutricionalEstado,
  PlanNutricionalSeguimientoEstado,
  PlanNutricionalSeguimientoItemEstado,
} from '../constant'
import { PlanNutricional } from '../entity/plan-nutricional.entity'

@Injectable()
export class PlanNutricionalRepository {
  constructor(private dataSource: DataSource) {}

  async crear(plan: PlanNutricional, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(PlanNutricional)
      .save(plan)
  }

  async actualizar(
    id: string,
    data: Partial<PlanNutricional>,
    usuario: string
  ) {
    const datosActualizar = new PlanNutricional({
      ...data,
      usuarioModificacion: usuario,
    })
    return await this.dataSource
      .getRepository(PlanNutricional)
      .update(id, datosActualizar)
  }

  async inactivar(id: string, usuario: string) {
    return await this.dataSource.getRepository(PlanNutricional).update(id, {
      estado: PlanNutricionalEstado.INACTIVO,
      usuarioModificacion: usuario,
    })
  }

  async buscarPorId(id: string, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(PlanNutricional)
      .createQueryBuilder('plan')
      .leftJoinAndSelect(
        'plan.alimentosPlanNutricional',
        'alimentoPlanNutricional',
        'alimentoPlanNutricional.estado = :estadoAlimento',
        {
          estadoAlimento: AlimentoPlanNutricionalEstado.ACTIVO,
        }
      )
      .leftJoinAndSelect('alimentoPlanNutricional.alimento', 'alimento')
      .leftJoinAndSelect('plan.paciente', 'asignacion')
      .leftJoinAndSelect(
        'plan.seguimiento',
        'seguimiento',
        'seguimiento.estado = :estadoSeguimiento',
        { estadoSeguimiento: PlanNutricionalSeguimientoEstado.ACTIVO }
      )
      .leftJoinAndSelect(
        'seguimiento.items',
        'seguimientoItems',
        'seguimientoItems.estado = :estadoSeguimientoItem',
        {
          estadoSeguimientoItem: PlanNutricionalSeguimientoItemEstado.ACTIVO,
        }
      )
      .where('plan.id = :id', { id })
      .getOne()
  }

  async buscarPorPacienteYFecha(idPaciente: string, fecha: string) {
    return await this.dataSource
      .getRepository(PlanNutricional)
      .createQueryBuilder('plan')
      .leftJoinAndSelect(
        'plan.alimentosPlanNutricional',
        'alimentoPlanNutricional',
        'alimentoPlanNutricional.estado =:estadoAlimento',
        {
          estadoAlimento: AlimentoPlanNutricionalEstado.ACTIVO,
        }
      )
      .leftJoinAndSelect('alimentoPlanNutricional.alimento', 'alimento')
      .leftJoinAndSelect('plan.paciente', 'asignacion')
      .leftJoinAndSelect(
        'plan.seguimiento',
        'seguimiento',
        'seguimiento.estado = :estadoSeguimiento',
        { estadoSeguimiento: PlanNutricionalSeguimientoEstado.ACTIVO }
      )
      .leftJoinAndSelect(
        'seguimiento.items',
        'seguimientoItems',
        'seguimientoItems.estado = :estadoSeguimientoItem',
        {
          estadoSeguimientoItem: PlanNutricionalSeguimientoItemEstado.ACTIVO,
        }
      )
      .where({
        idPaciente,
        fecha,
        estado: PlanNutricionalEstado.ACTIVO,
      })
      .getOne()
  }

  async listarTodos(paginacionQueryDto: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQueryDto

    const query = this.dataSource
      .getRepository(PlanNutricional)
      .createQueryBuilder('plan')
      .select([
        'plan.id',
        'plan.fecha',
        'plan.plan',
        'plan.recomendaciones',
        'plan.idPaciente',
        'plan.idEvaluacionNutricional',
        'plan.caloriasObjetivo',
        'plan.distribucionMacronutrientes',
        'plan.distribucionCalorica',
        'plan.esGeneradoAutomatico',
        'plan.estado',
        'plan.fechaCreacion',
      ])
      .take(limite)
      .skip(saltar)
      .where({ estado: PlanNutricionalEstado.ACTIVO })

    if (orden) {
      switch (orden) {
        case 'fecha':
          query.addOrderBy('plan.fecha', sentido)
          break
        case 'estado':
          query.addOrderBy('plan.estado', sentido)
          break
        default:
          query.addOrderBy('plan.id', 'ASC')
      }
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('plan.recomendaciones ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('plan.fecha ilike :filtro', { filtro: `%${filtro}%` })
        })
      )
    }

    return await query.getManyAndCount()
  }

  async listarPorIdPaciente(
    idPaciente: string,
    paginacionQueryDto: PaginacionQueryDto
  ) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQueryDto

    const query = this.dataSource
      .getRepository(PlanNutricional)
      .createQueryBuilder('plan')
      .leftJoinAndSelect(
        'plan.alimentosPlanNutricional',
        'alimentoPlanNutricional',
        'alimentoPlanNutricional.estado =:estadoAlimento',
        {
          estadoAlimento: AlimentoPlanNutricionalEstado.ACTIVO,
        }
      )
      .leftJoinAndSelect('alimentoPlanNutricional.alimento', 'alimento')
      .leftJoinAndSelect('plan.paciente', 'asignacion')
      .leftJoinAndSelect(
        'plan.seguimiento',
        'seguimiento',
        'seguimiento.estado = :estadoSeguimiento',
        { estadoSeguimiento: PlanNutricionalSeguimientoEstado.ACTIVO }
      )
      .leftJoinAndSelect(
        'seguimiento.items',
        'seguimientoItems',
        'seguimientoItems.estado = :estadoSeguimientoItem',
        {
          estadoSeguimientoItem: PlanNutricionalSeguimientoItemEstado.ACTIVO,
        }
      )
      .where('plan.idPaciente = :idPaciente', { idPaciente })
      .andWhere('plan.estado = :estado', {
        estado: PlanNutricionalEstado.ACTIVO,
      })
      .take(limite)
      .skip(saltar)

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('plan.recomendaciones ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('plan.fecha ilike :filtro', { filtro: `%${filtro}%` })
        })
      )
    }

    switch (orden) {
      case 'fecha':
        query.addOrderBy('plan.fecha', sentido)
        break
      case 'estado':
        query.addOrderBy('plan.estado', sentido)
        break
      default:
        query.addOrderBy('plan.fecha', 'DESC')
    }

    return await query.getManyAndCount()
  }

  async listarPorIdPacienteEntreFechas(
    idPaciente: string,
    fechaInicio?: string, // formato: 'YYYY-MM-DD'
    fechaFin?: string // formato: 'YYYY-MM-DD'
  ) {
    const query = this.dataSource
      .getRepository(PlanNutricional)
      .createQueryBuilder('plan')
      .leftJoinAndSelect(
        'plan.alimentosPlanNutricional',
        'alimentoPlanNutricional',
        'alimentoPlanNutricional.estado =:estadoAlimento',
        {
          estadoAlimento: AlimentoPlanNutricionalEstado.ACTIVO,
        }
      )
      .leftJoinAndSelect('alimentoPlanNutricional.alimento', 'alimento')
      .leftJoinAndSelect('plan.paciente', 'asignacion')
      .leftJoinAndSelect(
        'plan.seguimiento',
        'seguimiento',
        'seguimiento.estado = :estadoSeguimiento',
        { estadoSeguimiento: PlanNutricionalSeguimientoEstado.ACTIVO }
      )
      .leftJoinAndSelect(
        'seguimiento.items',
        'seguimientoItems',
        'seguimientoItems.estado = :estadoSeguimientoItem',
        {
          estadoSeguimientoItem: PlanNutricionalSeguimientoItemEstado.ACTIVO,
        }
      )
      .where('plan.idPaciente = :idPaciente', { idPaciente })
      .andWhere('plan.estado = :estado', {
        estado: PlanNutricionalEstado.ACTIVO,
      })

    if (fechaInicio && fechaFin) {
      query.andWhere('plan.fecha BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio,
        fechaFin,
      })
    }

    return await query.getMany()
  }

  async crearConTransaccion(
    data: Partial<PlanNutricional>,
    usuario: string,
    transaction: EntityManager
  ) {
    const repo = transaction.getRepository(PlanNutricional)
    const plan = new PlanNutricional({
      ...data,
      usuarioCreacion: usuario,
    })
    return await repo.save(plan)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
