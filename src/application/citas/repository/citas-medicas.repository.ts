import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import {
  DataSource,
  EntityManager,
  In,
  LessThan,
  SelectQueryBuilder,
} from 'typeorm'
import { Cita } from '../entities/cita.entity'
import { CitasEstado, TipoCita } from '../constants'
import {
  ActualizarEstadoCitaDto,
  CancelarCitaDto,
  FiltrosCitaDto,
  FiltrosCitaPaginadoDto,
  ReprogramarCitaDto,
} from '../dto/cita.dto'
import { Estudio } from '@/application/estudio/entities/estudio.entity'
import { Notificacion, NotificacionTipo } from '../entities/notificacion.entity'
import { HistorialCitasRepository } from './historial-citas.repository'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

@Injectable()
export class CitasMedicasRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly historialRepository: HistorialCitasRepository
  ) {}

  private citaRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Cita)
  }

  private notificacionRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Notificacion)
  }

  buildCitasQuery(
    filtros: FiltrosCitaDto | FiltrosCitaPaginadoDto,
    manager?: EntityManager
  ): SelectQueryBuilder<Cita> {
    const query = this.citaRepository(manager)
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.medico', 'medico')
      .leftJoinAndSelect('medico.usuario', 'usuarioMedico')
      .leftJoinAndSelect('usuarioMedico.persona', 'personaMedico')
      .leftJoinAndSelect(
        'medico.usuarioRolEspecialidades',
        'medicoEspecialidad'
      )
      .leftJoinAndSelect(
        'medicoEspecialidad.especialidad',
        'especialidadMedico'
      )
      .leftJoinAndSelect('cita.paciente', 'paciente')
      .leftJoinAndSelect('cita.consultorio', 'consultorio')
      .leftJoinAndSelect('cita.especialidad', 'especialidad')
      .leftJoinAndSelect('cita.estudio', 'estudio')
      .distinct(true)

    if (filtros.fechaInicio) {
      query.andWhere('cita.fechaInicio >= :fechaInicio', {
        fechaInicio: filtros.fechaInicio,
      })
    }

    if (filtros.fechaFin) {
      query.andWhere('cita.fechaFin <= :fechaFin', {
        fechaFin: filtros.fechaFin,
      })
    }

    if (filtros.idMedico) {
      query.andWhere('cita.idMedico = :medicoId', {
        medicoId: filtros.idMedico,
      })
    }

    if (filtros.estado) {
      query.andWhere('cita.estado = :estado', {
        estado: filtros.estado,
      })
    }

    return query
  }

  async listarCitas(filtros: FiltrosCitaDto) {
    return await this.buildCitasQuery(filtros).getMany()
  }

  async listarCitasPaginadas(filtros: FiltrosCitaPaginadoDto) {
    const { limite, saltar } = filtros
    return await this.buildCitasQuery(filtros)
      .take(limite)
      .skip(saltar)
      .getManyAndCount()
  }

  async obtenerCitaConRelaciones(id: string, manager?: EntityManager) {
    return await this.buildCitasQuery({}, manager)
      .andWhere('cita.id = :id', { id })
      .getOne()
  }

  async crearCita(
    data: {
      detalle: string
      fechaInicio: Date
      fechaFin: Date
      estado: CitasEstado
      tipoCita: TipoCita
      idMedico?: string
      idPaciente?: string | null
      idConsultorio?: string | null
      idEspecialidad?: string | null
      idEstudio?: string | null
    },
    usuarioAuditoria: string,
    rolEjecutor: string,
    transaccion: EntityManager
  ) {
    const cita = this.citaRepository(transaccion).create({
      detalle: data.detalle,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      estado: data.estado,
      tipoCita: data.tipoCita,
      usuarioCreacion: usuarioAuditoria,
      idMedico: data.idMedico,
      idPaciente: data.idPaciente ?? null,
      idConsultorio: data.idConsultorio ?? null,
      idEspecialidad: data.idEspecialidad ?? null,
      idEstudio: data.idEstudio ?? null,
    })

    const guardada = await this.citaRepository(transaccion).save(cita)

    await this.historialRepository.crearHistorial(
      {
        idCita: guardada.id,
        estadoAnterior: undefined,
        rolEjecutor,
        idEjecutor: usuarioAuditoria,
        comentario: 'Creación de cita',
        usuarioCreacion: usuarioAuditoria,
      },
      transaccion
    )

    if (guardada.idMedico && guardada.estado === CitasEstado.SOLICITADA) {
      const notificacion = this.notificacionRepository(transaccion).create({
        tipo: NotificacionTipo.CITA_SOLICITADA,
        mensaje: `Se asignó una nueva cita ${guardada.id} para confirmar.`,
        idCita: guardada.id,
        idMedico: guardada.idMedico,
        usuarioCreacion: usuarioAuditoria,
      })
      await this.notificacionRepository(transaccion).save(notificacion)
    }

    return guardada.id
  }

  async actualizarCita(
    cita: Cita,
    data: Partial<Cita>,
    usuarioAuditoria: string,
    rolEjecutor: string,
    transaccion: EntityManager
  ) {
    const estadoAnterior = cita.estado
    const detalleCambios = this.construirCambiosCita(cita, data)

    const patch: QueryDeepPartialEntity<Cita> = {
      usuarioModificacion: usuarioAuditoria,
    }

    if (data.detalle !== undefined) patch.detalle = data.detalle
    if (data.fechaInicio !== undefined) patch.fechaInicio = data.fechaInicio
    if (data.fechaFin !== undefined) patch.fechaFin = data.fechaFin
    if (data.idMedico !== undefined) patch.idMedico = data.idMedico
    if (data.idPaciente !== undefined) patch.idPaciente = data.idPaciente
    if (data.idConsultorio !== undefined)
      patch.idConsultorio = data.idConsultorio
    if (data.idEspecialidad !== undefined)
      patch.idEspecialidad = data.idEspecialidad

    if (data.tipoCita !== undefined) {
      patch.tipoCita = data.tipoCita
      if (data.tipoCita === TipoCita.ESTUDIO) {
        if (data.idEstudio !== undefined) {
          patch.idEstudio = data.idEstudio
        }
      } else {
        patch.idEstudio = null
      }
    }

    await this.citaRepository(transaccion).update(cita.id, {
      ...patch,
    })

    await this.historialRepository.crearHistorial(
      {
        idCita: cita.id,
        estadoAnterior,
        rolEjecutor,
        idEjecutor: usuarioAuditoria,
        comentario: 'Actualización de datos de cita',
        detalleCambios: detalleCambios.length ? detalleCambios : null,
        usuarioCreacion: usuarioAuditoria,
      },
      transaccion
    )

    return true
  }

  async actualizarEstadoCita(
    id: string,
    dto: ActualizarEstadoCitaDto,
    usuarioAuditoria: string,
    rolEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      const estadoAnterior = cita.estado
      cita.estado = dto.estado
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      await this.historialRepository.crearHistorial(
        {
          idCita: cita.id,
          estadoAnterior,
          rolEjecutor,
          idEjecutor: usuarioAuditoria,
          comentario: 'Actualización de estado de cita',
          detalleCambios: [
            {
              field: 'estado',
              before: estadoAnterior,
              after: cita.estado,
            },
          ],
          usuarioCreacion: usuarioAuditoria,
        },
        manager
      )
      return true
    })
  }

  async reprogramarCita(
    id: string,
    dto: ReprogramarCitaDto & { fechaFin: Date },
    usuarioAuditoria: string,
    rolEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      const estadoAnterior = cita.estado
      const fechaInicioAnterior = cita.fechaInicio
      const fechaFinAnterior = cita.fechaFin
      cita.fechaInicio = dayjs(dto.fechaInicio).toDate()
      cita.fechaFin = dto.fechaFin
      cita.estado =
        CitasEstado.RECHAZADA === cita.estado
          ? CitasEstado.SOLICITADA
          : (cita.estado as CitasEstado)
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      const detalleCambios = [
        {
          field: 'fechaInicio',
          before: fechaInicioAnterior?.toISOString(),
          after: cita.fechaInicio?.toISOString(),
        },
        {
          field: 'fechaFin',
          before: fechaFinAnterior?.toISOString(),
          after: cita.fechaFin?.toISOString(),
        },
      ]
      if (estadoAnterior !== cita.estado) {
        detalleCambios.push({
          field: 'estado',
          before: estadoAnterior,
          after: cita.estado,
        })
      }
      await this.historialRepository.crearHistorial(
        {
          idCita: cita.id,
          estadoAnterior,
          rolEjecutor,
          idEjecutor: usuarioAuditoria,
          comentario: 'Reprogramación de cita',
          detalleCambios,
          usuarioCreacion: usuarioAuditoria,
        },
        manager
      )
      return true
    })
  }

  async cancelarCita(
    id: string,
    dto: CancelarCitaDto,
    usuarioAuditoria: string,
    rolEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      const estadoAnterior = cita.estado
      cita.estado = CitasEstado.CANCELADA
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      await this.historialRepository.crearHistorial(
        {
          idCita: cita.id,
          estadoAnterior,
          rolEjecutor,
          idEjecutor: usuarioAuditoria,
          comentario: dto.comentario ?? null,
          detalleCambios: [
            {
              field: 'estado',
              before: estadoAnterior,
              after: cita.estado,
            },
          ],
          usuarioCreacion: usuarioAuditoria,
        },
        manager
      )
      return true
    })
  }

  private construirCambiosCita(cita: Cita, data: Partial<Cita>) {
    const cambios: Array<{ field: string; before?: string; after?: string }> =
      []
    const agregarCambio = (field: string, before?: string, after?: string) => {
      if (before !== after) {
        cambios.push({ field, before, after })
      }
    }

    agregarCambio('detalle', cita.detalle, data.detalle ?? cita.detalle)
    agregarCambio(
      'fechaInicio',
      cita.fechaInicio?.toISOString(),
      data.fechaInicio?.toISOString()
    )
    agregarCambio(
      'fechaFin',
      cita.fechaFin?.toISOString(),
      data.fechaFin?.toISOString()
    )
    agregarCambio('idMedico', cita.idMedico, data.idMedico ?? cita.idMedico)
    agregarCambio(
      'idPaciente',
      cita.idPaciente ?? undefined,
      data.idPaciente !== undefined
        ? (data.idPaciente ?? undefined)
        : (cita.idPaciente ?? undefined)
    )
    agregarCambio(
      'idConsultorio',
      cita.idConsultorio ?? undefined,
      data.idConsultorio !== undefined
        ? (data.idConsultorio ?? undefined)
        : (cita.idConsultorio ?? undefined)
    )
    agregarCambio(
      'idEspecialidad',
      cita.idEspecialidad ?? undefined,
      data.idEspecialidad !== undefined
        ? (data.idEspecialidad ?? undefined)
        : (cita.idEspecialidad ?? undefined)
    )
    agregarCambio(
      'idEstudio',
      cita.idEstudio ?? undefined,
      data.tipoCita === TipoCita.ESTUDIO
        ? (data.idEstudio ?? cita.idEstudio ?? undefined)
        : data.tipoCita === TipoCita.CONSULTA
          ? undefined
          : (cita.idEstudio ?? undefined)
    )
    agregarCambio('tipoCita', cita.tipoCita, data.tipoCita ?? cita.tipoCita)

    return cambios
  }

  async marcarCitasVencidas(
    fechaCorte: Date,
    usuarioAuditoria: string,
    rolEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const estadosElegibles = [
        CitasEstado.SOLICITADA,
        CitasEstado.CONFIRMADA,
        CitasEstado.EN_CURSO,
      ]
      const citasVencidas = await this.citaRepository(manager).find({
        where: {
          fechaInicio: LessThan(fechaCorte),
          estado: In(estadosElegibles),
        },
      })

      if (!citasVencidas.length) {
        return 0
      }

      const citasConEstadoAnterior = citasVencidas.map((cita) => ({
        cita,
        estadoAnterior: cita.estado,
      }))

      citasConEstadoAnterior.forEach(({ cita }) => {
        cita.estado = CitasEstado.NO_ASISTIO
        cita.usuarioModificacion = usuarioAuditoria
      })

      await this.citaRepository(manager).save(
        citasConEstadoAnterior.map(({ cita }) => cita)
      )

      await this.historialRepository.crearHistoriales(
        citasConEstadoAnterior.map(({ cita, estadoAnterior }) => ({
          idCita: cita.id,
          estadoAnterior,
          rolEjecutor,
          idEjecutor: usuarioAuditoria,
          comentario: 'Actualización automática por cita vencida',
          usuarioCreacion: usuarioAuditoria,
        })),
        manager
      )

      const notificaciones = citasConEstadoAnterior.map(({ cita }) =>
        this.notificacionRepository(manager).create({
          tipo: NotificacionTipo.CITA_NO_ASISTIO,
          mensaje: `La cita ${cita.id} fue marcada como no asistida por vencimiento.`,
          idCita: cita.id,
          idMedico: cita.idMedico ?? null,
          usuarioCreacion: usuarioAuditoria,
        })
      )

      await this.notificacionRepository(manager).save(notificaciones)

      return citasConEstadoAnterior.length
    })
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }

  async obtenerEstudioPorEspecialidad(
    idEstudio: string,
    idEspecialidad: string,
    manager?: EntityManager
  ) {
    const entityManager = manager ?? this.dataSource.manager
    return await entityManager
      .getRepository(Estudio)
      .createQueryBuilder('estudio')
      .innerJoin(
        'estudio.estudioEspecialidades',
        'estudioEspecialidad',
        'estudioEspecialidad.especialidadId = :idEspecialidad',
        { idEspecialidad }
      )
      .where('estudio.id = :idEstudio', { idEstudio })
      .getOne()
  }
}
