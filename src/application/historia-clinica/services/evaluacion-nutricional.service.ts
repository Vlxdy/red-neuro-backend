import { BaseService } from '@/common/base/base-service'
import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { EvaluacionNutricional } from '../entities/evaluacion-nutricional.entity'
import { EvaluacionAntropometrica } from '../entities/eval-antropometrica.entity'
import { EvaluacionBioquimica } from '../entities/eval-bioquimica.entity'
import { EvaluacionDietetica } from '../entities/eval-dietetica.entity'
import { EvaluacionClinica } from '../entities/eval-clinica.entity'
import { EvaluacionPsicosocial } from '../entities/eval-psicosocial.entity'
import { ArchivoAdjunto } from '../entities/archivos-adjunto.entity'
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
import {
  EvaluacionArchivosService,
  EvaluacionArchivoTemporal,
} from './evaluacion-archivos.service'
import { RolEnum, RolEnumId } from '@/core/authorization/rol.enum'
import { Status } from '@/common/constants'
import { ArchivoDescargable } from '../types/archivo-descargable.type'

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
    private readonly citasService: CitasService,
    private readonly evaluacionArchivosService: EvaluacionArchivosService
  ) {
    super()
  }

  async crearEvaluacion({
    idHistoriaClinica,
    data,
    usuarioAuditoria,
    idMedico,
    transaccion,
    archivos = [],
  }: {
    idHistoriaClinica: string
    data: CreateEvaluacionAntropometricaDto
    usuarioAuditoria: string
    idMedico: string
    transaccion?: EntityManager
    archivos?: EvaluacionArchivoTemporal[]
  }) {
    if (!transaccion) {
      return this.dataSource.transaction((manager) =>
        this.crearEvaluacion({
          idHistoriaClinica,
          data,
          usuarioAuditoria,
          idMedico,
          transaccion: manager,
          archivos,
        })
      )
    }

    const historiaClinica =
      await this.historiaClinicaService.obtenerHistoriaClinica(
        idHistoriaClinica,
        transaccion
      )

    const fechaEvaluacion = dayjs().toString()

    const imcCalculado = this.calcularImc(data.peso, data.talla)

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
        idRol: RolEnumId.NUTRICIONISTA,
        idUsuarioRol: idMedico,
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
          data: { estado: CitasEstado.COMPLETADA },
          idMedico: historiaClinica.idMedico,
          usuarioAuditoria,
          transaccion,
        })
      }
    }

    let archivosPendientes = archivos

    try {
      const creada = await transaccion
        .getRepository(EvaluacionNutricional)
        .save(evaluacion)

      if (archivosPendientes.length) {
        await this.evaluacionArchivosService.adjuntarArchivos({
          archivos: archivosPendientes,
          idEvaluacionNutricional: creada.id,
          idHistoriaClinica,
          usuarioAuditoria,
          transaccion,
        })
        archivosPendientes = []
      }

      return { id: creada.id }
    } catch (error) {
      if (archivosPendientes.length) {
        await this.evaluacionArchivosService.limpiarTemporales(
          archivosPendientes
        )
      }
      throw error
    }
  }

  async modificarEvaluacion({
    idEvaluacionNutricional,
    data,
    usuarioAuditoria,
    transaccion,
    archivos = [],
  }: {
    idEvaluacionNutricional: string
    data: ActualizarEvaluacionAntropometricaDto
    usuarioAuditoria: string
    transaccion?: EntityManager
    archivos?: EvaluacionArchivoTemporal[]
  }) {
    if (!transaccion) {
      return this.dataSource.transaction((manager) =>
        this.modificarEvaluacion({
          idEvaluacionNutricional,
          data,
          usuarioAuditoria,
          transaccion: manager,
          archivos,
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

    if (data.peso !== undefined) {
      evaluacion.peso = data.peso
    }

    if (data.talla !== undefined) {
      evaluacion.talla = data.talla
    }

    if (data.peso && data.talla) {
      evaluacion.imc = this.calcularImc(data.peso, data.talla)
    }

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

    let archivosPendientes = archivos

    try {
      await transaccion.getRepository(EvaluacionNutricional).save(evaluacion)

      if (archivosPendientes.length) {
        await this.evaluacionArchivosService.adjuntarArchivos({
          archivos: archivosPendientes,
          idEvaluacionNutricional,
          idHistoriaClinica: evaluacion.idHistoriaClinica,
          usuarioAuditoria,
          transaccion,
        })
        archivosPendientes = []
      }

      return this.obtenerEvaluacion(idEvaluacionNutricional, {
        include: [...EVALUACION_RELACIONES],
      })
    } catch (error) {
      if (archivosPendientes.length) {
        await this.evaluacionArchivosService.limpiarTemporales(
          archivosPendientes
        )
      }
      throw error
    }
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

    query.leftJoinAndSelect(
      `evaluacion.archivos`,
      'archivos',
      'archivos.estado = :estadoArchivo',
      { estadoArchivo: Status.ACTIVE }
    )

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

  async obtenerArchivoDescargable({
    idArchivo,
    idEvaluacion,
    solicitante,
  }: {
    idArchivo: string
    idEvaluacion: string
    solicitante: PassportUser
  }): Promise<ArchivoDescargable> {
    const archivo = await this.dataSource
      .getRepository(ArchivoAdjunto)
      .createQueryBuilder('archivo')
      .leftJoinAndSelect('archivo.historiaClinica', 'historiaClinica')
      .where('archivo.id = :idArchivo', { idArchivo })
      .andWhere('archivo.idEvaluacionNutricional = :idEvaluacion', {
        idEvaluacion,
      })
      .getOne()

    if (!archivo || !archivo.historiaClinica) {
      throw new NotFoundException('Archivo adjunto no encontrado')
    }

    const roles = new Set(
      (solicitante.roles ?? []).map((rol) => rol.toUpperCase())
    )
    const esAdmin = roles.has(RolEnum.ADMINISTRADOR)
    const esNutricionista = roles.has(RolEnum.NUTRICIONISTA)
    const esPacientePropietario =
      roles.has(RolEnum.PACIENTE) &&
      solicitante.idUsuarioRol &&
      archivo.historiaClinica.idPaciente === solicitante.idUsuarioRol

    if (!(esAdmin || esNutricionista || esPacientePropietario)) {
      throw new ForbiddenException(
        'No tiene permisos para acceder a este archivo adjunto'
      )
    }

    const rutaFinal =
      await this.evaluacionArchivosService.obtenerRutaFinal(archivo)
    const mimeType = archivo.tipoArchivo ?? 'application/octet-stream'
    const nombreArchivo = archivo.nombreArchivo

    if (rutaFinal) {
      return {
        tipo: 'path',
        path: rutaFinal,
        nombreArchivo,
        mimeType,
      }
    }

    if (archivo.contenidoBase64) {
      return {
        tipo: 'buffer',
        buffer: Buffer.from(archivo.contenidoBase64, 'base64'),
        nombreArchivo,
        mimeType,
      }
    }

    throw new NotFoundException(
      'El archivo adjunto no tiene contenido disponible para descargar'
    )
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
      archivos: this.mapArchivos(evaluacion.archivos),
      antropometria: this.mapAntropometria(evaluacion.antropometria),
      bioquimica: this.mapBioquimica(evaluacion.bioquimica),
      dietetica: this.mapDietetica(evaluacion.dietetica),
      clinica: this.mapClinica(evaluacion.clinica),
      psicosocial: this.mapPsicosocial(evaluacion.psicosocial),
    }
  }

  private mapArchivos(archivos?: ArchivoAdjunto[]) {
    if (!archivos || archivos.length === 0) {
      return null
    }

    return archivos.map((archivo) => ({
      id: archivo.id,
      nombreArchivo: archivo.nombreArchivo,
      codigo: archivo.codigo ?? null,
      tipoArchivo: archivo.tipoArchivo,
      contenidoBase64: archivo.contenidoBase64 ?? null,
      idHistoriaClinica: archivo.idHistoriaClinica,
      idEvaluacionNutricional: archivo.idEvaluacionNutricional ?? null,
      idAntecedente: (archivo as any).idAntecedente ?? null,
      metadatos: archivo.metadatos ?? null,
      fechaCreacion: archivo.fechaCreacion,
    }))
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

  private calcularImc(peso: number, talla: number): number {
    if (talla <= 0)
      throw new PreconditionFailedException(
        'La talla debe ser un número mayor que cero'
      )
    const resultado = peso / Math.pow(talla, 2)
    return Math.round(resultado * 100) / 100
  }
}
