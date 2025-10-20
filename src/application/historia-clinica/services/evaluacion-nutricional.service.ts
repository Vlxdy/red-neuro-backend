import { BaseService } from '@/common/base/base-service'
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { EvaluacionNutricional } from '../entities/evaluacion-nutricional.entity'
import { EvaluacionAntropometrica } from '../entities/eval-antropometrica.entity'
import { EvaluacionBioquimica } from '../entities/eval-bioquimica.entity'
import { EvaluacionDietetica } from '../entities/eval-dietetica.entity'
import { EvaluacionClinica } from '../entities/eval-clinica.entity'
import { EvaluacionPsicosocial } from '../entities/eval-psicosocial.entity'
import {
  ActualizarEvaluacionAntropometricaDto,
  CreateEvaluacionAntropometricaDto,
  EvaluacionInclude,
  EVALUACION_RELACIONES,
  QueryEvaluacionesDto,
} from '../dtos/evaluacion.dto'
import { HistoriaClinicaService } from './historia-clinico.service'
import { CitasService } from '@/application/gestion-pacientes/services/citas.service'
import dayjs from 'dayjs'
import { CitasEstado } from '@/application/gestion-pacientes/constant'
import { EvaluacionNutricionalResponde } from '@/common/types/data-response.type'

@Injectable()
export class EvaluacionNutricionalService extends BaseService {
  constructor(
    @InjectRepository(EvaluacionNutricional)
    private readonly evaluacionRepository: Repository<EvaluacionNutricional>,
    @InjectRepository(EvaluacionAntropometrica)
    private readonly antropometriaRepository: Repository<EvaluacionAntropometrica>,
    @InjectRepository(EvaluacionBioquimica)
    private readonly bioquimicaRepository: Repository<EvaluacionBioquimica>,
    @InjectRepository(EvaluacionDietetica)
    private readonly dieteticaRepository: Repository<EvaluacionDietetica>,
    @InjectRepository(EvaluacionClinica)
    private readonly clinicaRepository: Repository<EvaluacionClinica>,
    @InjectRepository(EvaluacionPsicosocial)
    private readonly psicosocialRepository: Repository<EvaluacionPsicosocial>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => HistoriaClinicaService))
    private readonly historiaClinicaService: HistoriaClinicaService,
    private readonly citasService: CitasService
  ) {
    super()
  }

  async crearEvaluacion({
    idHistoriaClinica,
    data,
    usuarioAuditoria,
    idMedico,
    transaccion,
  }: {
    idHistoriaClinica: string
    data: CreateEvaluacionAntropometricaDto
    usuarioAuditoria: string
    idMedico: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      return this.dataSource.transaction((manager) =>
        this.crearEvaluacion({
          idHistoriaClinica,
          data,
          usuarioAuditoria,
          idMedico,
          transaccion: manager,
        })
      )
    }

    const historiaClinica =
      await this.historiaClinicaService.obtenerHistoriaClinica(
        idHistoriaClinica,
        transaccion
      )

    const fechaEvaluacion = dayjs().toISOString()

    const imcCalculado = this.calcularImc(data.peso, data.talla, data.imc)

    const evaluacion = transaccion.getRepository(EvaluacionNutricional).create({
      idHistoriaClinica,
      fechaEvaluacion,
      peso: data.peso,
      talla: data.talla,
      imc: imcCalculado,
      diagnosticoNutricional: data.diagnosticoNutricional,
      observaciones: data.observaciones,
      usuarioCreacion: usuarioAuditoria,
      antropometria: data.antropometria
        ? transaccion.getRepository(EvaluacionAntropometrica).create({
            ...data.antropometria,
            usuarioCreacion: usuarioAuditoria,
          })
        : undefined,
      bioquimica: data.bioquimica
        ? transaccion.getRepository(EvaluacionBioquimica).create({
            ...data.bioquimica,
            usuarioCreacion: usuarioAuditoria,
          })
        : undefined,
      dietetica: data.dietetica
        ? transaccion.getRepository(EvaluacionDietetica).create({
            ...data.dietetica,
            usuarioCreacion: usuarioAuditoria,
          })
        : undefined,
      clinica: data.clinica
        ? transaccion.getRepository(EvaluacionClinica).create({
            ...data.clinica,
            usuarioCreacion: usuarioAuditoria,
          })
        : undefined,
      psicosocial: data.psicosocial
        ? transaccion.getRepository(EvaluacionPsicosocial).create({
            ...data.psicosocial,
            usuarioCreacion: usuarioAuditoria,
          })
        : undefined,
    })

    let idCita = data.idCita
    if (!idCita) {
      const citaCreada = await this.citasService.crearCita({
        idMedico,
        data: {
          idPaciente: historiaClinica.idPaciente,
          detalle: 'Evaluación nutricional',
          fechaInicio: dayjs(fechaEvaluacion).toDate(),
          fechaFin: dayjs(fechaEvaluacion).add(30, 'minute').toDate(),
        },
        usuarioAuditoria,
        transaccion,
      })
      idCita = citaCreada.id
    }

    if (idCita) {
      evaluacion.idCita = idCita
      const cita = await this.citasService.buscarPorId(idCita, transaccion)
      if (cita) {
        if (data.forzarFecha) {
          evaluacion.fechaEvaluacion = dayjs(cita.fechaInicio).format(
            'YYYY-MM-DD'
          )
        }
        await this.citasService.actualizarCita({
          idCita: cita.id,
          data: { estado: CitasEstado.CONCLUIDA },
          idMedico: historiaClinica.idMedico,
          usuarioAuditoria,
          transaccion,
        })
      }
    }

    const creada = await transaccion
      .getRepository(EvaluacionNutricional)
      .save(evaluacion)

    return { id: creada.id }
  }

  async modificarEvaluacion({
    idEvaluacionNutricional,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idEvaluacionNutricional: string
    data: ActualizarEvaluacionAntropometricaDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      return this.dataSource.transaction((manager) =>
        this.modificarEvaluacion({
          idEvaluacionNutricional,
          data,
          usuarioAuditoria,
          transaccion: manager,
        })
      )
    }

    const evaluacion = await transaccion
      .getRepository(EvaluacionNutricional)
      .findOne({
        where: { id: idEvaluacionNutricional },
        relations: [...EVALUACION_RELACIONES],
      })

    if (!evaluacion) {
      throw new NotFoundException('Evaluación nutricional no encontrada')
    }

    if (data.historiaClinicaId) {
      evaluacion.idHistoriaClinica = data.historiaClinicaId
    }

    if (data.fechaEvaluacion) {
      evaluacion.fechaEvaluacion = data.fechaEvaluacion
    }

    if (data.peso !== undefined) {
      evaluacion.peso = data.peso
    }

    if (data.talla !== undefined) {
      evaluacion.talla = data.talla
    }

    evaluacion.imc = this.calcularImc(
      data.peso ?? evaluacion.peso,
      data.talla ?? evaluacion.talla,
      data.imc ?? evaluacion.imc
    )

    if (data.diagnosticoNutricional !== undefined) {
      evaluacion.diagnosticoNutricional = data.diagnosticoNutricional
    }

    if (data.observaciones !== undefined) {
      evaluacion.observaciones = data.observaciones
    }

    if (data.antropometria) {
      if (evaluacion.antropometria) {
        Object.assign(evaluacion.antropometria, data.antropometria)
        evaluacion.antropometria.usuarioModificacion = usuarioAuditoria
      } else {
        evaluacion.antropometria = this.antropometriaRepository.create({
          ...data.antropometria,
          usuarioCreacion: usuarioAuditoria,
        })
      }
    }

    if (data.bioquimica) {
      if (evaluacion.bioquimica) {
        Object.assign(evaluacion.bioquimica, data.bioquimica)
        evaluacion.bioquimica.usuarioModificacion = usuarioAuditoria
      } else {
        evaluacion.bioquimica = this.bioquimicaRepository.create({
          ...data.bioquimica,
          usuarioCreacion: usuarioAuditoria,
        })
      }
    }

    if (data.dietetica) {
      if (evaluacion.dietetica) {
        Object.assign(evaluacion.dietetica, data.dietetica)
        evaluacion.dietetica.usuarioModificacion = usuarioAuditoria
      } else {
        evaluacion.dietetica = this.dieteticaRepository.create({
          ...data.dietetica,
          usuarioCreacion: usuarioAuditoria,
        })
      }
    }

    if (data.clinica) {
      if (evaluacion.clinica) {
        Object.assign(evaluacion.clinica, data.clinica)
        evaluacion.clinica.usuarioModificacion = usuarioAuditoria
      } else {
        evaluacion.clinica = this.clinicaRepository.create({
          ...data.clinica,
          usuarioCreacion: usuarioAuditoria,
        })
      }
    }

    if (data.psicosocial) {
      if (evaluacion.psicosocial) {
        Object.assign(evaluacion.psicosocial, data.psicosocial)
        evaluacion.psicosocial.usuarioModificacion = usuarioAuditoria
      } else {
        evaluacion.psicosocial = this.psicosocialRepository.create({
          ...data.psicosocial,
          usuarioCreacion: usuarioAuditoria,
        })
      }
    }

    evaluacion.usuarioModificacion = usuarioAuditoria

    await transaccion.getRepository(EvaluacionNutricional).save(evaluacion)

    return this.obtenerEvaluacion(idEvaluacionNutricional, {
      include: [...EVALUACION_RELACIONES],
    })
  }

  async listarEvaluacionesPorHistoriaClinica({
    idHistoriaClinica,
    paginacion,
  }: {
    idHistoriaClinica: string
    paginacion: QueryEvaluacionesDto
  }): Promise<[EvaluacionNutricionalResponde[], number]> {
    const { limite, saltar } = paginacion

    const query = this.evaluacionRepository.createQueryBuilder('evaluacion')
    query.where('evaluacion.idHistoriaClinica = :idHistoriaClinica', {
      idHistoriaClinica,
    })

    if (paginacion.fechaDesde) {
      query.andWhere('evaluacion.fechaEvaluacion >= :fechaDesde', {
        fechaDesde: paginacion.fechaDesde,
      })
    }

    if (paginacion.fechaHasta) {
      query.andWhere('evaluacion.fechaEvaluacion <= :fechaHasta', {
        fechaHasta: paginacion.fechaHasta,
      })
    }

    const relaciones = this.obtenerRelaciones(paginacion.include)
    relaciones.forEach((relacion) => {
      query.leftJoinAndSelect(`evaluacion.${relacion}`, relacion)
    })

    query.orderBy('evaluacion.fechaEvaluacion', 'DESC')
    query.take(limite)
    query.skip(saltar)

    const [evaluaciones, total] = await query.getManyAndCount()

    return [
      evaluaciones.map((evaluacion) => this.formatearEvaluacion(evaluacion)),
      total,
    ]
  }

  async obtenerEvaluacion(
    id: string,
    query?: { include?: EvaluacionInclude[] }
  ) {
    const evaluacion = await this.evaluacionRepository.findOne({
      where: { id },
      relations: this.obtenerRelaciones(query?.include),
    })

    if (!evaluacion) {
      throw new NotFoundException('Evaluación nutricional no encontrada')
    }

    return this.formatearEvaluacion(evaluacion)
  }

  async ultimaEvaluacion({
    idHistoriaClinica,
    transaccion,
  }: {
    idHistoriaClinica: string
    transaccion?: EntityManager
  }) {
    const repository = transaccion
      ? transaccion.getRepository(EvaluacionNutricional)
      : this.evaluacionRepository

    const evaluacion = await repository.findOne({
      where: { idHistoriaClinica },
      order: { fechaEvaluacion: 'DESC' },
      relations: this.obtenerRelaciones([...EVALUACION_RELACIONES]),
    })

    return evaluacion ? this.formatearEvaluacion(evaluacion) : null
  }

  private formatearEvaluacion(
    evaluacion: EvaluacionNutricional
  ): EvaluacionNutricionalResponde {
    return {
      id: evaluacion.id,
      idHistoriaClinica: evaluacion.idHistoriaClinica,
      fechaEvaluacion: evaluacion.fechaEvaluacion,
      fechaCreacion: evaluacion.fechaCreacion,
      estado: evaluacion.estado,
      peso: evaluacion.peso ?? null,
      talla: evaluacion.talla ?? null,
      imc: evaluacion.imc ?? null,
      diagnosticoNutricional: evaluacion.diagnosticoNutricional ?? null,
      observaciones: evaluacion.observaciones ?? null,
      archivos: null,
      antropometria: this.mapAntropometria(evaluacion.antropometria),
      bioquimica: this.mapBioquimica(evaluacion.bioquimica),
      dietetica: this.mapDietetica(evaluacion.dietetica),
      clinica: this.mapClinica(evaluacion.clinica),
      psicosocial: this.mapPsicosocial(evaluacion.psicosocial),
    }
  }

  private mapAntropometria(antropometria?: EvaluacionAntropometrica) {
    if (!antropometria) return null

    return {
      circunferenciaCintura: antropometria.circunferenciaCintura ?? null,
      circunferenciaCadera: antropometria.circunferenciaCadera ?? null,
      cinturaCaderaRatio: antropometria.cinturaCaderaRatio ?? null,
      pliegueTricipital: antropometria.pliegueTricipital ?? null,
      porcentajeGrasa: antropometria.porcentajeGrasa ?? null,
      porcentajeMusculo: antropometria.porcentajeMusculo ?? null,
      aguaCorporal: antropometria.aguaCorporal ?? null,
    }
  }

  private mapBioquimica(bioquimica?: EvaluacionBioquimica) {
    if (!bioquimica) return null

    return {
      glucosa: bioquimica.glucosa ?? null,
      colesterolTotal: bioquimica.colesterolTotal ?? null,
      trigliceridos: bioquimica.trigliceridos ?? null,
      hdl: bioquimica.hdl ?? null,
      ldl: bioquimica.ldl ?? null,
      hemoglobina: bioquimica.hemoglobina ?? null,
      ferritina: bioquimica.ferritina ?? null,
    }
  }

  private mapDietetica(dietetica?: EvaluacionDietetica) {
    if (!dietetica) return null

    return {
      caloriasTotales: dietetica.caloriasTotales ?? null,
      numeroComidasDiarias: dietetica.numeroComidasDiarias ?? null,
      registroAlimentario: dietetica.registroAlimentario ?? null,
      nivelConsumoAzucar: dietetica.nivelConsumoAzucar ?? null,
      nivelHidratacion: dietetica.nivelHidratacion ?? null,
    }
  }

  private mapClinica(clinica?: EvaluacionClinica) {
    if (!clinica) return null

    return {
      patologiasPrevias: clinica.patologiasPrevias ?? null,
      medicacionActual: clinica.medicacionActual ?? null,
      nauseas: clinica.nauseas ?? null,
      vomitos: clinica.vomitos ?? null,
      diarrea: clinica.diarrea ?? null,
      fatiga: clinica.fatiga ?? null,
    }
  }

  private mapPsicosocial(psicosocial?: EvaluacionPsicosocial) {
    if (!psicosocial) return null

    return {
      nivelMotivacion: psicosocial.nivelMotivacion ?? null,
      estresAlimentario: psicosocial.estresAlimentario ?? null,
      ansiedad: psicosocial.ansiedad ?? null,
      apoyoFamiliar: psicosocial.apoyoFamiliar ?? null,
      cumplimientoDieta: psicosocial.cumplimientoDieta ?? null,
    }
  }

  private obtenerRelaciones(include?: EvaluacionInclude[]) {
    if (!include || include.length === 0) {
      return []
    }

    const set = new Set(include)
    return EVALUACION_RELACIONES.filter((relacion) => set.has(relacion))
  }

  private calcularImc(
    peso?: number,
    talla?: number,
    imc?: number | null
  ): number | undefined {
    if (imc !== undefined && imc !== null) {
      const valor = Number(imc)
      return Math.round(valor * 100) / 100
    }

    if (
      peso !== undefined &&
      peso !== null &&
      talla !== undefined &&
      talla !== null &&
      talla > 0
    ) {
      const resultado = Number(peso) / Math.pow(Number(talla), 2)
      return Math.round(resultado * 100) / 100
    }

    return undefined
  }
}
