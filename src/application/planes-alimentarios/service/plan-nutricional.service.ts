import { AsignacionRepository } from '@/application/gestion-pacientes/repositories/asignacion.repository'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { EvaluacionNutricionalResponde } from '@/common/types/data-response.type'
import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common'
import { EntityManager } from 'typeorm'
import dayjs from 'dayjs'
import {
  ActualizarPlanNutricionalDto,
  CrearPlanNutricionalDto,
  GenerarPlanNutricionalDto,
  PlanAlimentoDto,
  PlanNutricionalGeneradoResponseDto,
  PlanNutricionalSeguimientoResponseDto,
  RegistrarSeguimientoPlanDto,
} from '../dto/plan-nutricional.dto'
import { AlimentoPlanNutricional } from '../entity/alimento-plan-nutricional.entity'
import {
  PlanNutricional,
  PlanNutricionalDistribucionCalorica,
  PlanNutricionalDistribucionMacronutrienteDetalle,
  PlanNutricionalDistribucionMacronutrientes,
  PlanNutricionalTiempoCalorico,
} from '../entity/plan-nutricional.entity'
import {
  PlanNutricionalSeguimiento,
  PlanNutricionalSeguimientoItem,
} from '../entity/plan-nutricional-seguimiento.entity'
import { AlimentoPlanNutricionalRepository } from '../repository/alimento-plan-nutricional.repository'
import { PlanNutricionalRepository } from '../repository/plan-nutricional.repository'
import { PlanNutricionalSeguimientoRepository } from '../repository/plan-nutricional-seguimiento.repository'
import { AlimentoService } from './alimento.service'
import { CategoriaAlimento } from '../constant'
import { Alimento, TipoAlimento } from '../entity/alimento.entity'
import { HistoriaClinicaService } from '@/application/historia-clinica/services/historia-clinico.service'
import { EvaluacionNutricionalService } from '@/application/historia-clinica/services/evaluacion-nutricional.service'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Asignacion } from '@/application/gestion-pacientes/entities/asignados.entity'
import { RolEnumId } from '@/core/authorization/rol.enum'
import { BaseException } from '@/core/logger'

interface PlanAlimentoGenerado {
  idAlimento: string
  cantidad: number
  tipo: TipoAlimento
  alimento: Alimento
}

interface PlanPreparado {
  asignacion: Asignacion
  plan: Partial<PlanNutricional>
  alimentos: PlanAlimentoGenerado[]
}

interface PlanRestricciones {
  evitarCategorias: Set<CategoriaAlimento>
  hidratacionBaja: boolean
}

const DEFAULT_MACRO_RATIOS = {
  carbohidratos: 0.5,
  proteinas: 0.2,
  grasas: 0.3,
} as const

const DEFAULT_TIME_RATIOS: Record<TipoAlimento, number> = {
  [TipoAlimento.DESAYUNO]: 0.25,
  [TipoAlimento.MEDIA_MANIANA]: 0.1,
  [TipoAlimento.ALMUERZO]: 0.35,
  [TipoAlimento.MEDIA_TARDE]: 0.1,
  [TipoAlimento.CENA]: 0.2,
}

const DEFAULT_PLAN_BLUEPRINT: Record<TipoAlimento, CategoriaAlimento[]> = {
  [TipoAlimento.DESAYUNO]: [
    CategoriaAlimento.CEREAL,
    CategoriaAlimento.LACTEO,
    CategoriaAlimento.FRUTA,
  ],
  [TipoAlimento.MEDIA_MANIANA]: [
    CategoriaAlimento.FRUTA,
    CategoriaAlimento.FRUTA_SECA,
  ],
  [TipoAlimento.ALMUERZO]: [
    CategoriaAlimento.PROTEINA_ANIMAL,
    CategoriaAlimento.CEREAL,
    CategoriaAlimento.VERDURA,
    CategoriaAlimento.GRASA_SALUDABLE,
  ],
  [TipoAlimento.MEDIA_TARDE]: [
    CategoriaAlimento.LACTEO,
    CategoriaAlimento.FRUTA,
  ],
  [TipoAlimento.CENA]: [
    CategoriaAlimento.PROTEINA_ANIMAL,
    CategoriaAlimento.LEGUMBRE,
    CategoriaAlimento.VERDURA,
  ],
}

const MIN_SERVING = 0.25
const MAX_SERVING = 3

@Injectable()
export class PlanNutricionalService {
  constructor(
    private readonly repository: PlanNutricionalRepository,
    private readonly seguimientoRepository: PlanNutricionalSeguimientoRepository,
    private readonly alimentoPlanNutricionalRepository: AlimentoPlanNutricionalRepository,
    private readonly asignacionRepository: AsignacionRepository,
    private readonly alimentosService: AlimentoService,
    private readonly historiaClinicaService: HistoriaClinicaService,
    private readonly evaluacionNutricionalService: EvaluacionNutricionalService,
    private readonly usuarioRolRepository: UsuarioRolRepository
  ) {}

  async crear(
    data: CrearPlanNutricionalDto,
    usuario: string,
    transaccion?: EntityManager
  ): Promise<PlanNutricionalGeneradoResponseDto> {
    if (transaccion) {
      const planCreado = await this.crearPlan(data, usuario, transaccion)
      return this.construirRespuesta(planCreado, true)
    }

    return await this.repository.runTransaction(async (manager) => {
      const planCreado = await this.crearPlan(data, usuario, manager)
      return this.construirRespuesta(planCreado, true)
    })
  }

  async crearMultiple(data: CrearPlanNutricionalDto[], usuario: string) {
    const op = async (transaccion: EntityManager) => {
      const promises = data.map(async (plan) => {
        await this.crearPlan(plan, usuario, transaccion)
      })
      await Promise.all(promises)
      return { creados: data.length }
    }

    return await this.repository.runTransaction(op)
  }

  async generar(
    data: GenerarPlanNutricionalDto
  ): Promise<PlanNutricionalGeneradoResponseDto> {
    const asignacion = await this.obtenerAsignacionPorUsuarioRol(
      data.idUsuarioRol
    )

    if (data.reutilizarPlanExistente) {
      const existente = await this.repository.buscarPorPacienteYFecha(
        asignacion.id,
        dayjs(data.fecha).format('YYYY-MM-DD')
      )
      if (existente) {
        return this.construirRespuesta(existente, true)
      }
    }

    const preparado = await this.prepararPlan({
      idUsuarioRol: data.idUsuarioRol,
      fecha: data.fecha,
      autoGenerar: true,
      alimentosManuales: [],
      transaccion: undefined,
    })

    return this.construirRespuestaPropuesta(
      dayjs(data.fecha).format('YYYY-MM-DD'),
      preparado
    )
  }

  async actualizar(
    id: string,
    data: ActualizarPlanNutricionalDto,
    usuario: string
  ): Promise<PlanNutricionalGeneradoResponseDto> {
    return await this.repository.runTransaction(async (manager) => {
      const planActual = await this.repository.buscarPorId(id, manager)
      if (!planActual) {
        throw new NotFoundException('Plan nutricional no encontrado')
      }

      const asignacion = await this.asignacionRepository.buscarPorId(
        planActual.idPaciente
      )
      if (!asignacion) {
        throw new NotFoundException('Paciente no encontrado')
      }

      const preparado = await this.prepararPlan({
        idUsuarioRol: asignacion.idPaciente,
        fecha: planActual.fecha,
        autoGenerar: data.autoGenerar,
        alimentosManuales: data.autoGenerar ? [] : (data.alimentos ?? []),
        recomendacionesPersonalizadas:
          data.recomendaciones ?? planActual.recomendaciones ?? undefined,
        transaccion: manager,
      })

      await this.repository.actualizar(
        id,
        {
          idEvaluacionNutricional:
            preparado.plan.idEvaluacionNutricional ?? null,
          caloriasObjetivo: preparado.plan.caloriasObjetivo ?? null,
          distribucionMacronutrientes:
            preparado.plan.distribucionMacronutrientes ?? null,
          distribucionCalorica: preparado.plan.distribucionCalorica ?? null,
          recomendaciones: preparado.plan.recomendaciones ?? null,
          esGeneradoAutomatico: preparado.plan.esGeneradoAutomatico ?? false,
        },
        usuario
      )

      for (const alimento of planActual.alimentosPlanNutricional ?? []) {
        await this.alimentoPlanNutricionalRepository.inactivar(
          alimento.id,
          usuario
        )
      }

      await this.persistirAlimentos(id, preparado.alimentos, usuario, manager)

      const planActualizado = await this.repository.buscarPorId(id, manager)
      if (!planActualizado) {
        throw new NotFoundException('Plan nutricional no encontrado')
      }

      return this.construirRespuesta(planActualizado, true)
    })
  }

  async inactivar(id: string, usuario: string) {
    const plan = await this.repository.buscarPorId(id)
    if (!plan) throw new NotFoundException('Plan nutricional no encontrado')

    await this.repository.inactivar(id, usuario)
    return { mensaje: 'Plan nutricional inactivado correctamente' }
  }

  async buscarPorId(id: string): Promise<PlanNutricionalGeneradoResponseDto> {
    const plan = await this.repository.buscarPorId(id)
    if (!plan) throw new NotFoundException('Plan nutricional no encontrado')
    return this.construirRespuesta(plan, true)
  }

  async buscarPorUsuarioRolYFecha(
    idUsuarioRol: string,
    fecha: string,
    rolId: RolEnumId
  ): Promise<{
    encontrado: boolean
    planNutricional: PlanNutricionalGeneradoResponseDto | null
  }> {
    const asignacion = await this.obtenerAsignacionPorUsuarioRol(idUsuarioRol)

    if (
      rolId === RolEnumId.PACIENTE &&
      asignacion.idPaciente !== idUsuarioRol
    ) {
      throw new ForbiddenException(
        'No tiene permisos para consultar este plan nutricional.'
      )
    }
    const planNutricional = await this.repository.buscarPorPacienteYFecha(
      asignacion.id,
      fecha
    )

    return {
      encontrado: !!planNutricional,
      planNutricional: planNutricional
        ? this.construirRespuesta(planNutricional, true)
        : null,
    }
  }

  async listarTodos(
    paginacionQueryDto: PaginacionQueryDto
  ): Promise<[PlanNutricionalGeneradoResponseDto[], number]> {
    const [planes, total] =
      await this.repository.listarTodos(paginacionQueryDto)
    const respuesta = planes.map((plan) => this.construirRespuesta(plan, true))
    return [respuesta, total]
  }

  async listarPorIdPaciente(
    idUsuarioRol: string,
    paginacionQueryDto: PaginacionQueryDto
  ): Promise<[PlanNutricionalGeneradoResponseDto[], number]> {
    const asignacion = await this.obtenerAsignacionPorUsuarioRol(idUsuarioRol)
    const resultado = await this.repository.listarPorIdPaciente(
      asignacion.id,
      paginacionQueryDto
    )

    const planesNutricionales = resultado[0].map((planNutricional) =>
      this.construirRespuesta(planNutricional, true)
    )

    return [planesNutricionales, resultado[1]]
  }

  async listarPorIdPacienteEntreFechas(
    idUsuarioRol: string,
    fechaInicio?: string,
    fechaFin?: string
  ) {
    const asignacion = await this.obtenerAsignacionPorUsuarioRol(idUsuarioRol)
    const resultado = await this.repository.listarPorIdPacienteEntreFechas(
      asignacion.id,
      fechaInicio,
      fechaFin
    )

    const planesNutricionales = resultado.map((planNutricional) => {
      return planNutricional.alimentosPlanNutricional.map((apn) => ({
        id: apn.id,
        cantidad: Number(apn.cantidad),
        estado: apn.estado,
        tipo: apn.tipo,
        nombre: apn.alimento.nombre,
        categoria: apn.alimento.categoria,
        unidadMedida: apn.alimento.unidadMedida,
        calorias: apn.alimento.calorias,
        cantidadReferencial: apn.alimento.cantidadReferencial,
        idAlimento: apn.alimento.id,
      }))
    })

    const alimentosNutricionales = planesNutricionales.flat()

    const alimentosDto: any[] = []

    alimentosNutricionales.forEach((alimento) => {
      const alimentoExistente = alimentosDto.find(
        (a) => a.idAlimento === alimento.idAlimento
      )
      if (alimentoExistente) {
        alimentoExistente.cantidad += alimento.cantidad
      } else {
        alimentosDto.push(alimento)
      }
    })

    return alimentosDto
  }

  async registrarSeguimiento(
    idPlan: string,
    data: RegistrarSeguimientoPlanDto,
    actor: { idUsuario: string; idUsuarioRol: string; rolId: RolEnumId }
  ): Promise<PlanNutricionalSeguimientoResponseDto> {
    if (actor.rolId !== RolEnumId.PACIENTE) {
      throw new ForbiddenException(
        'Solo el paciente puede registrar el seguimiento del plan.'
      )
    }

    return await this.repository.runTransaction(async (manager) => {
      const plan = await this.repository.buscarPorId(idPlan, manager)
      if (!plan) {
        throw new NotFoundException('Plan nutricional no encontrado')
      }

      const asignacion = plan.paciente
        ? plan.paciente
        : await this.asignacionRepository.buscarPorId(plan.idPaciente)

      if (!asignacion) {
        throw new NotFoundException('Paciente no encontrado')
      }

      if (asignacion.idPaciente !== actor.idUsuarioRol) {
        throw new ForbiddenException(
          'No tiene permisos para actualizar el seguimiento de este plan.'
        )
      }

      const comentario = this.normalizarComentario(data.comentario)
      let seguimiento = await this.seguimientoRepository.buscarPorPlan(
        plan.id,
        manager
      )

      if (!seguimiento) {
        const nuevoSeguimiento = new PlanNutricionalSeguimiento({
          idPlanNutricional: plan.id,
          idUsuarioRolPaciente: asignacion.idPaciente,
          comentario,
          usuarioCreacion: actor.idUsuario,
        })
        seguimiento = await this.seguimientoRepository.crear(
          nuevoSeguimiento,
          manager
        )
      } else {
        await this.seguimientoRepository.actualizar(
          seguimiento.id,
          { comentario },
          actor.idUsuario,
          manager
        )
      }

      if (typeof data.items !== 'undefined') {
        const idsValidos = new Set(
          (plan.alimentosPlanNutricional ?? []).map((alimento) => alimento.id)
        )

        for (const item of data.items) {
          if (!idsValidos.has(item.idAlimentoPlanNutricional)) {
            throw new NotFoundException(
              'El alimento indicado no forma parte del plan nutricional.'
            )
          }
        }

        await this.seguimientoRepository.inactivarItemsPorSeguimiento(
          seguimiento.id,
          actor.idUsuario,
          manager
        )

        for (const item of data.items) {
          const detalle = new PlanNutricionalSeguimientoItem({
            idSeguimiento: seguimiento.id,
            idAlimentoPlanNutricional: item.idAlimentoPlanNutricional,
            cumplido: item.cumplido,
            usuarioCreacion: actor.idUsuario,
          })
          await this.seguimientoRepository.crearItem(detalle, manager)
        }
      }

      const seguimientoActualizado =
        await this.seguimientoRepository.buscarPorPlan(plan.id, manager)

      return (
        this.construirSeguimientoRespuesta(seguimientoActualizado) ?? {
          id: seguimiento.id,
          comentario,
          fechaRegistro: seguimiento.fechaCreacion,
          items: [],
        }
      )
    })
  }
  private async crearPlan(
    data: CrearPlanNutricionalDto,
    usuario: string,
    transaccion: EntityManager
  ) {
    const historiaClinica = await this.historiaClinicaService.buscarPorPaciente(
      data.idUsuarioRol,
      transaccion
    )
    if (!historiaClinica)
      throw new PreconditionFailedException(
        'No se encontro la historia Clinica'
      )

    const ultimaEvaluacion =
      await this.evaluacionNutricionalService.ultimaEvaluacion({
        idHistoriaClinica: historiaClinica.id,
        transaccion,
      })
    if (!ultimaEvaluacion)
      throw new PreconditionFailedException(
        'Es necesario que se haga una evaluación nutricional antes de crear un plan alimentario'
      )

    const preparado = await this.prepararPlan({
      idUsuarioRol: data.idUsuarioRol,
      fecha: data.fecha,
      autoGenerar: data.autoGenerar,
      alimentosManuales: data.autoGenerar ? [] : (data.alimentos ?? []),
      recomendacionesPersonalizadas: data.recomendaciones,
      transaccion,
    })

    const plan = new PlanNutricional({
      idPaciente: preparado.asignacion.id,
      fecha: dayjs(data.fecha).format('YYYY-MM-DD'),
      usuarioCreacion: usuario,
      idEvaluacionNutricional: preparado.plan.idEvaluacionNutricional ?? null,
      caloriasObjetivo: ultimaEvaluacion.requerimientoCalorico,
      distribucionMacronutrientes:
        preparado.plan.distribucionMacronutrientes ?? null,
      distribucionCalorica: preparado.plan.distribucionCalorica ?? null,
      recomendaciones: preparado.plan.recomendaciones ?? null,
      esGeneradoAutomatico: preparado.plan.esGeneradoAutomatico ?? false,
    })

    const nuevoPlan = await this.repository.crear(plan, transaccion)

    await this.persistirAlimentos(
      nuevoPlan.id,
      preparado.alimentos,
      usuario,
      transaccion
    )

    const planConRelaciones = await this.repository.buscarPorId(
      nuevoPlan.id,
      transaccion
    )
    if (!planConRelaciones) {
      throw new NotFoundException('No se pudo recuperar el plan generado')
    }
    return planConRelaciones
  }

  private async prepararPlan({
    idUsuarioRol,
    fecha,
    autoGenerar,
    alimentosManuales,
    recomendacionesPersonalizadas,
    transaccion,
  }: {
    idUsuarioRol: string
    fecha: string
    autoGenerar?: boolean
    alimentosManuales: PlanAlimentoDto[]
    recomendacionesPersonalizadas?: string
    transaccion?: EntityManager
  }): Promise<PlanPreparado> {
    const asignacion = await this.obtenerAsignacionPorUsuarioRol(
      idUsuarioRol,
      transaccion
    )

    const historiaClinica = await this.historiaClinicaService.buscarPorPaciente(
      asignacion.idPaciente,
      transaccion
    )

    const evaluacion = historiaClinica
      ? await this.evaluacionNutricionalService.ultimaEvaluacion({
          idHistoriaClinica: historiaClinica.id,
          transaccion,
        })
      : null

    if (!evaluacion) {
      throw new BaseException(new Error('SIN_EVALUACION'), {
        mensaje:
          'Se requiere registrar una evaluación nutricional antes de generar un plan.',
        httpStatus: HttpStatus.PRECONDITION_FAILED,
        clientInfo: { codigo: 'SIN_EVALUACION' },
      })
    }

    const usuarioRol = await this.usuarioRolRepository.buscarPorId(
      idUsuarioRol,
      transaccion
    )

    const caloriasObjetivo = this.calcularCaloriasObjetivo(
      evaluacion,
      usuarioRol
    )
    const distribucionObjetivo =
      this.calcularDistribucionCaloricaObjetivo(caloriasObjetivo)
    const macrosObjetivo =
      this.calcularMacronutrientesObjetivo(caloriasObjetivo)

    const restricciones = this.obtenerRestricciones(evaluacion)
    const blueprint = this.obtenerBlueprint(restricciones)

    const debeGenerar = autoGenerar || !alimentosManuales?.length

    let alimentosPlan: PlanAlimentoGenerado[]
    if (debeGenerar) {
      alimentosPlan = await this.generarAlimentosAutomaticos({
        blueprint,
        distribucionObjetivo,
        caloriasObjetivo,
        restricciones,
        transaccion,
      })

      if (!alimentosPlan.length) {
        throw new NotFoundException(
          'No se pudo generar el plan con los alimentos disponibles'
        )
      }
    } else {
      alimentosPlan = await this.enriquecerAlimentos(
        alimentosManuales,
        transaccion
      )
    }

    const resumenNutricional = this.calcularResumenNutricional(
      alimentosPlan,
      macrosObjetivo,
      distribucionObjetivo,
      caloriasObjetivo
    )

    const recomendaciones =
      recomendacionesPersonalizadas ??
      this.generarRecomendaciones({
        evaluacion,
        caloriasObjetivo: resumenNutricional.caloriasObjetivo,
        restricciones,
        fecha,
      })

    return {
      asignacion,
      plan: {
        idEvaluacionNutricional: evaluacion?.id ?? null,
        caloriasObjetivo: resumenNutricional.caloriasObjetivo,
        distribucionMacronutrientes:
          resumenNutricional.distribucionMacronutrientes,
        distribucionCalorica: resumenNutricional.distribucionCalorica,
        recomendaciones,
        esGeneradoAutomatico: debeGenerar,
      },
      alimentos: alimentosPlan,
    }
  }

  private async persistirAlimentos(
    idPlan: string,
    alimentos: PlanAlimentoGenerado[],
    usuario: string,
    transaccion: EntityManager
  ) {
    for (const alimento of alimentos) {
      const registro = new AlimentoPlanNutricional({
        idPlanNutricional: idPlan,
        idAlimento: alimento.idAlimento,
        cantidad: alimento.cantidad,
        tipo: alimento.tipo,
        usuarioCreacion: usuario,
      })
      await this.alimentoPlanNutricionalRepository.crear(registro, transaccion)
    }
  }

  private construirSeguimientoRespuesta(
    seguimiento?: PlanNutricionalSeguimiento | null
  ): PlanNutricionalSeguimientoResponseDto | null {
    if (!seguimiento) {
      return null
    }

    const items = (seguimiento.items ?? []).map((item) => ({
      id: item.id,
      idAlimentoPlanNutricional: item.idAlimentoPlanNutricional,
      cumplido: item.cumplido,
      fechaRegistro: item.fechaCreacion,
    }))

    return {
      id: seguimiento.id,
      comentario: seguimiento.comentario ?? null,
      fechaRegistro: seguimiento.fechaCreacion,
      items,
    }
  }

  private normalizarComentario(comentario?: string | null) {
    if (typeof comentario !== 'string') {
      return null
    }
    const limpio = comentario.trim()
    return limpio.length ? limpio : null
  }

  private construirRespuesta(
    plan: PlanNutricional,
    persistido: boolean
  ): PlanNutricionalGeneradoResponseDto {
    const alimentos = (plan.alimentosPlanNutricional ?? []).map((apn) => {
      const cantidad = this.toNumber(apn.cantidad)
      const caloriasBase = this.toNumber(apn.alimento?.calorias)
      return {
        id: apn.id,
        idAlimento: apn.idAlimento,
        nombre: apn.alimento?.nombre ?? '',
        categoria: apn.alimento?.categoria ?? CategoriaAlimento.CEREAL,
        unidadMedida: apn.alimento?.unidadMedida,
        cantidadReferencial: this.toNumber(apn.alimento?.cantidadReferencial),
        cantidad,
        tipo: apn.tipo,
        calorias: this.redondear(caloriasBase * cantidad),
        carbohidratos: this.redondear(
          this.toNumber(apn.alimento?.carbohidratos) * cantidad
        ),
        proteinas: this.redondear(
          this.toNumber(apn.alimento?.proteinas) * cantidad
        ),
        grasa: this.redondear(this.toNumber(apn.alimento?.grasa) * cantidad),
        urlImage: apn.alimento?.urlImage ?? null,
      }
    })

    const seguimiento = this.construirSeguimientoRespuesta(plan.seguimiento)

    return {
      id: plan.id,
      fecha: plan.fecha,
      idPaciente: plan.idPaciente,
      idEvaluacionNutricional: plan.idEvaluacionNutricional ?? null,
      caloriasObjetivo: plan.caloriasObjetivo
        ? this.redondear(Number(plan.caloriasObjetivo))
        : null,
      distribucionMacronutrientes: this.normalizarDistribucionMacronutrientes(
        plan.distribucionMacronutrientes
      ),
      distribucionCalorica: this.normalizarDistribucionCalorica(
        plan.distribucionCalorica
      ),
      esGeneradoAutomatico: plan.esGeneradoAutomatico,
      recomendaciones: plan.recomendaciones ?? null,
      alimentos,
      seguimiento,
      persistido,
    }
  }

  private construirRespuestaPropuesta(
    fecha: string,
    preparado: PlanPreparado
  ): PlanNutricionalGeneradoResponseDto {
    const alimentos = preparado.alimentos.map((item) => {
      const cantidad = this.toNumber(item.cantidad)
      return {
        id: undefined,
        idAlimento: item.idAlimento,
        nombre: item.alimento.nombre,
        categoria: item.alimento.categoria,
        unidadMedida: item.alimento.unidadMedida,
        cantidadReferencial: this.toNumber(item.alimento.cantidadReferencial),
        cantidad,
        tipo: item.tipo,
        calorias: this.redondear(
          this.toNumber(item.alimento.calorias) * cantidad
        ),
        carbohidratos: this.redondear(
          this.toNumber(item.alimento.carbohidratos) * cantidad
        ),
        proteinas: this.redondear(
          this.toNumber(item.alimento.proteinas) * cantidad
        ),
        grasa: this.redondear(this.toNumber(item.alimento.grasa) * cantidad),
        urlImage: item.alimento.urlImage ?? null,
      }
    })

    return {
      id: undefined,
      fecha,
      idPaciente: preparado.asignacion.id,
      idEvaluacionNutricional: preparado.plan.idEvaluacionNutricional ?? null,
      caloriasObjetivo: preparado.plan.caloriasObjetivo ?? null,
      distribucionMacronutrientes:
        preparado.plan.distribucionMacronutrientes ?? null,
      distribucionCalorica: preparado.plan.distribucionCalorica ?? null,
      esGeneradoAutomatico: preparado.plan.esGeneradoAutomatico ?? false,
      recomendaciones: preparado.plan.recomendaciones ?? null,
      alimentos,
      seguimiento: null,
      persistido: false,
    }
  }

  private async obtenerAsignacionPorUsuarioRol(
    idUsuarioRol: string,
    transaccion?: EntityManager
  ) {
    const paciente =
      await this.asignacionRepository.buscarPacientePorIdUsuarioRol(
        idUsuarioRol,
        transaccion
      )

    if (!paciente) throw new NotFoundException('Paciente no encontrado')
    return paciente
  }
  private calcularCaloriasObjetivo(
    evaluacion: EvaluacionNutricionalResponde | null,
    usuarioRol?: UsuarioRol | null
  ): number {
    if (evaluacion?.dietetica?.caloriasTotales) {
      return this.redondear(Number(evaluacion.dietetica.caloriasTotales))
    }

    const peso = this.toNumber(evaluacion?.peso)
    const talla = this.toNumber(evaluacion?.talla)
    const alturaCm = talla > 3 ? talla : talla * 100
    const genero = usuarioRol?.usuario?.persona?.genero?.toLowerCase() ?? 'm'
    const fechaNacimiento = usuarioRol?.usuario?.persona?.fechaNacimiento
    const edad = fechaNacimiento
      ? dayjs().diff(dayjs(fechaNacimiento), 'year')
      : 30

    if (!peso || !alturaCm) {
      return 2000
    }

    const factorSexo = genero.startsWith('f') ? -161 : 5
    const tasaBasal = 10 * peso + 6.25 * alturaCm - 5 * edad + factorSexo
    const factorActividad = this.obtenerFactorActividad(evaluacion)
    return this.redondear(tasaBasal * factorActividad)
  }

  private obtenerFactorActividad(
    evaluacion: EvaluacionNutricionalResponde | null
  ) {
    const comidas = evaluacion?.dietetica?.numeroComidasDiarias ?? 4
    if (comidas <= 3) return 1.2
    if (comidas === 4) return 1.375
    if (comidas === 5) return 1.465
    return 1.55
  }

  private calcularMacronutrientesObjetivo(
    caloriasObjetivo: number
  ): PlanNutricionalDistribucionMacronutrienteDetalle {
    const total = caloriasObjetivo > 0 ? caloriasObjetivo : 2000
    return {
      carbohidratos: this.calcularDetalleMacronutriente(
        total,
        DEFAULT_MACRO_RATIOS.carbohidratos,
        4
      ),
      proteinas: this.calcularDetalleMacronutriente(
        total,
        DEFAULT_MACRO_RATIOS.proteinas,
        4
      ),
      grasas: this.calcularDetalleMacronutriente(
        total,
        DEFAULT_MACRO_RATIOS.grasas,
        9
      ),
    }
  }

  private calcularDetalleMacronutriente(
    caloriasTotales: number,
    porcentaje: number,
    caloriasPorGramo: number
  ) {
    const calorias = caloriasTotales * porcentaje
    return {
      gramos: this.redondear(calorias / caloriasPorGramo),
      calorias: this.redondear(calorias),
      porcentaje: this.redondear(porcentaje, 4),
    }
  }

  private calcularDistribucionCaloricaObjetivo(
    caloriasObjetivo: number
  ): PlanNutricionalTiempoCalorico[] {
    const total = caloriasObjetivo > 0 ? caloriasObjetivo : 2000
    return Object.entries(DEFAULT_TIME_RATIOS).map(([tiempo, porcentaje]) => ({
      tipo: tiempo as TipoAlimento,
      calorias: this.redondear(total * porcentaje),
      porcentaje: this.redondear(Number(porcentaje), 4),
    }))
  }

  private obtenerRestricciones(
    evaluacion: EvaluacionNutricionalResponde | null
  ): PlanRestricciones {
    const evitarCategorias = new Set<CategoriaAlimento>()
    const diagnostico = evaluacion?.diagnosticoNutricional?.toLowerCase() ?? ''
    const patologias =
      evaluacion?.clinica?.patologiasPrevias?.toLowerCase() ?? ''
    const consumoAzucar = evaluacion?.dietetica?.nivelConsumoAzucar ?? 0

    if (
      diagnostico.includes('diabet') ||
      patologias.includes('diabet') ||
      consumoAzucar >= 4
    ) {
      evitarCategorias.add(CategoriaAlimento.ENDULZANTE)
    }

    return {
      evitarCategorias,
      hidratacionBaja: (evaluacion?.dietetica?.nivelHidratacion ?? 3) <= 2,
    }
  }

  private obtenerBlueprint(restricciones: PlanRestricciones) {
    const blueprint: Record<TipoAlimento, CategoriaAlimento[]> = {} as Record<
      TipoAlimento,
      CategoriaAlimento[]
    >

    for (const [tipo, categorias] of Object.entries(DEFAULT_PLAN_BLUEPRINT)) {
      const filtradas = categorias.filter(
        (categoria) => !restricciones.evitarCategorias.has(categoria)
      )
      blueprint[tipo as TipoAlimento] = filtradas.length
        ? [...filtradas]
        : [...categorias]
    }

    if (restricciones.hidratacionBaja) {
      const bebidas = blueprint[TipoAlimento.MEDIA_MANIANA]
      if (!bebidas.includes(CategoriaAlimento.BEBIDA)) {
        bebidas.push(CategoriaAlimento.BEBIDA)
      }
    }

    return blueprint
  }

  private async generarAlimentosAutomaticos({
    blueprint,
    distribucionObjetivo,
    caloriasObjetivo,
    restricciones,
    transaccion,
  }: {
    blueprint: Record<TipoAlimento, CategoriaAlimento[]>
    distribucionObjetivo: PlanNutricionalTiempoCalorico[]
    caloriasObjetivo: number
    restricciones: PlanRestricciones
    transaccion?: EntityManager
  }): Promise<PlanAlimentoGenerado[]> {
    const catalogo = await this.alimentosService.listarPorCategorias(
      [],
      transaccion
    )
    if (!catalogo.length) {
      return []
    }

    const alimentosPorCategoria = new Map<CategoriaAlimento, Alimento[]>(
      Object.values(CategoriaAlimento).map((categoria) => [categoria, []])
    )

    for (const alimento of catalogo) {
      const categoria = alimento.categoria
      const lista = alimentosPorCategoria.get(categoria)
      if (lista) {
        lista.push(alimento)
        lista.sort(
          (a, b) => this.toNumber(a.calorias) - this.toNumber(b.calorias)
        )
      }
    }

    const fallback = [...catalogo]
    const plan: PlanAlimentoGenerado[] = []

    for (const tiempo of distribucionObjetivo) {
      const categorias = blueprint[tiempo.tipo] ?? []
      const caloriasTiempo =
        tiempo.calorias || caloriasObjetivo * DEFAULT_TIME_RATIOS[tiempo.tipo]
      const categoriasObjetivo = categorias.length
        ? categorias
        : [CategoriaAlimento.VERDURA, CategoriaAlimento.FRUTA]
      const caloriasPorCategoria = caloriasTiempo / categoriasObjetivo.length

      for (const categoria of categoriasObjetivo) {
        const alimento = this.obtenerAlimentoDisponible(
          categoria,
          alimentosPorCategoria,
          fallback,
          restricciones
        )

        if (!alimento) {
          continue
        }

        const cantidad = this.calcularCantidadPorCalorias(
          caloriasPorCategoria,
          this.toNumber(alimento.calorias)
        )

        plan.push({
          idAlimento: alimento.id,
          cantidad,
          tipo: tiempo.tipo,
          alimento,
        })
      }
    }

    return plan
  }

  private obtenerAlimentoDisponible(
    categoria: CategoriaAlimento,
    porCategoria: Map<CategoriaAlimento, Alimento[]>,
    fallback: Alimento[],
    restricciones: PlanRestricciones
  ) {
    const lista = porCategoria.get(categoria) ?? []
    while (lista.length) {
      const alimento = lista.shift()
      if (alimento && !this.alimentoRestringido(alimento, restricciones)) {
        return alimento
      }
    }

    while (fallback.length) {
      const alimento = fallback.shift()
      if (alimento && !this.alimentoRestringido(alimento, restricciones)) {
        return alimento
      }
    }

    return undefined
  }

  private alimentoRestringido(
    alimento: Alimento,
    restricciones: PlanRestricciones
  ) {
    return restricciones.evitarCategorias.has(alimento.categoria)
  }

  private async enriquecerAlimentos(
    alimentos: PlanAlimentoDto[],
    transaccion?: EntityManager
  ): Promise<PlanAlimentoGenerado[]> {
    if (!alimentos?.length) {
      return []
    }

    const respuesta: PlanAlimentoGenerado[] = []
    for (const item of alimentos) {
      const alimento = await this.alimentosService.buscarPorId(
        item.idAlimento,
        transaccion
      )
      respuesta.push({
        idAlimento: item.idAlimento,
        cantidad: this.toNumber(item.cantidad),
        tipo: item.tipo,
        alimento,
      })
    }
    return respuesta
  }

  private calcularResumenNutricional(
    alimentos: PlanAlimentoGenerado[],
    macrosObjetivo: PlanNutricionalDistribucionMacronutrienteDetalle,
    distribucionObjetivo: PlanNutricionalTiempoCalorico[],
    caloriasObjetivo: number
  ) {
    let caloriasTotales = 0
    let carbohidratos = 0
    let proteinas = 0
    let grasas = 0
    const caloriasPorTiempo = new Map<TipoAlimento, number>()

    for (const item of alimentos) {
      const cantidad = this.toNumber(item.cantidad)
      const calorias = this.toNumber(item.alimento.calorias) * cantidad
      caloriasTotales += calorias
      carbohidratos += this.toNumber(item.alimento.carbohidratos) * cantidad
      proteinas += this.toNumber(item.alimento.proteinas) * cantidad
      grasas += this.toNumber(item.alimento.grasa) * cantidad

      const acumulado = caloriasPorTiempo.get(item.tipo) ?? 0
      caloriasPorTiempo.set(item.tipo, acumulado + calorias)
    }

    const macrosPlan: PlanNutricionalDistribucionMacronutrienteDetalle = {
      carbohidratos: {
        gramos: this.redondear(carbohidratos),
        calorias: this.redondear(carbohidratos * 4),
        porcentaje: this.calcularPorcentaje(carbohidratos * 4, caloriasTotales),
      },
      proteinas: {
        gramos: this.redondear(proteinas),
        calorias: this.redondear(proteinas * 4),
        porcentaje: this.calcularPorcentaje(proteinas * 4, caloriasTotales),
      },
      grasas: {
        gramos: this.redondear(grasas),
        calorias: this.redondear(grasas * 9),
        porcentaje: this.calcularPorcentaje(grasas * 9, caloriasTotales),
      },
    }

    const distribucionPlan: PlanNutricionalTiempoCalorico[] = Array.from(
      caloriasPorTiempo.entries()
    ).map(([tipo, calorias]) => ({
      tipo,
      calorias: this.redondear(calorias),
      porcentaje: this.calcularPorcentaje(calorias, caloriasTotales),
    }))

    const distribucionCalorica: PlanNutricionalDistribucionCalorica = {
      objetivo: distribucionObjetivo,
      planGenerado: distribucionPlan,
    }

    const distribucionMacronutrientes: PlanNutricionalDistribucionMacronutrientes =
      {
        objetivo: macrosObjetivo,
        planGenerado: macrosPlan,
      }

    return {
      caloriasObjetivo: caloriasObjetivo || this.redondear(caloriasTotales),
      distribucionCalorica,
      distribucionMacronutrientes,
    }
  }

  private normalizarDistribucionMacronutrientes(
    distribucion?: PlanNutricionalDistribucionMacronutrientes | null
  ): PlanNutricionalDistribucionMacronutrientes | null {
    if (!distribucion) {
      return null
    }

    return {
      objetivo: this.normalizarDetalleMacronutriente(distribucion.objetivo),
      planGenerado: this.normalizarDetalleMacronutriente(
        distribucion.planGenerado
      ),
    }
  }

  private normalizarDetalleMacronutriente(
    detalle: PlanNutricionalDistribucionMacronutrienteDetalle
  ) {
    return {
      carbohidratos: {
        gramos: this.redondear(detalle.carbohidratos.gramos),
        calorias: this.redondear(detalle.carbohidratos.calorias),
        porcentaje: this.redondear(detalle.carbohidratos.porcentaje, 4),
      },
      proteinas: {
        gramos: this.redondear(detalle.proteinas.gramos),
        calorias: this.redondear(detalle.proteinas.calorias),
        porcentaje: this.redondear(detalle.proteinas.porcentaje, 4),
      },
      grasas: {
        gramos: this.redondear(detalle.grasas.gramos),
        calorias: this.redondear(detalle.grasas.calorias),
        porcentaje: this.redondear(detalle.grasas.porcentaje, 4),
      },
    }
  }

  private normalizarDistribucionCalorica(
    distribucion?: PlanNutricionalDistribucionCalorica | null
  ): PlanNutricionalDistribucionCalorica | null {
    if (!distribucion) {
      return null
    }

    const normalizar = (lista: PlanNutricionalTiempoCalorico[]) =>
      lista.map((item) => ({
        tipo: item.tipo,
        calorias: this.redondear(item.calorias),
        porcentaje: this.redondear(item.porcentaje, 4),
      }))

    return {
      objetivo: normalizar(distribucion.objetivo ?? []),
      planGenerado: normalizar(distribucion.planGenerado ?? []),
    }
  }

  private generarRecomendaciones({
    evaluacion,
    caloriasObjetivo,
    restricciones,
    fecha,
  }: {
    evaluacion: EvaluacionNutricionalResponde | null
    caloriasObjetivo: number
    restricciones: PlanRestricciones
    fecha: string
  }) {
    const recomendaciones: string[] = []

    if (evaluacion?.diagnosticoNutricional) {
      recomendaciones.push(
        `Diagnóstico nutricional: ${evaluacion.diagnosticoNutricional}`
      )
    }

    if (evaluacion?.observaciones) {
      recomendaciones.push(evaluacion.observaciones)
    }

    if (restricciones.hidratacionBaja) {
      recomendaciones.push(
        'Incrementar la ingesta de agua a al menos 8 vasos al día.'
      )
    }

    if (restricciones.evitarCategorias.has(CategoriaAlimento.ENDULZANTE)) {
      recomendaciones.push(
        'Priorizar alimentos con bajo índice glucémico y evitar azúcares simples.'
      )
    }

    recomendaciones.push(
      `Objetivo diario aproximado: ${this.redondear(caloriasObjetivo)} kcal distribuidas en cinco tiempos de comida (${fecha}).`
    )

    return recomendaciones.join('\n')
  }

  private calcularPorcentaje(valor: number, total: number) {
    if (!total) return 0
    return this.redondear(valor / total, 4)
  }

  private calcularCantidadPorCalorias(
    caloriasObjetivo: number,
    caloriasBase: number
  ) {
    if (!caloriasBase) {
      return 1
    }
    const calculado = caloriasObjetivo / caloriasBase
    const limitado = Math.min(Math.max(calculado, MIN_SERVING), MAX_SERVING)
    return this.redondear(limitado, 2)
  }

  private toNumber(value?: number | string | null) {
    if (value === undefined || value === null) {
      return 0
    }
    return Number(value)
  }

  private redondear(valor: number, decimales = 2) {
    const factor = Math.pow(10, decimales)
    return Math.round(valor * factor) / factor
  }
}
