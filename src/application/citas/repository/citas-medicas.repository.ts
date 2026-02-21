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
import { Servicio } from '@/application/estudio/entities/estudio.entity'
import {
  Notificacion,
  NotificacionTipo,
  TipoActualizacion,
} from '../entities/notificacion.entity'
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
      .leftJoinAndSelect('cita.servicio', 'servicio')
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
      detalle?: string
      fechaInicio: Date
      fechaFin: Date
      estado: CitasEstado
      tipoCita: TipoCita
      idMedico?: string
      idPaciente?: string | null
      idConsultorio?: string | null
      idEspecialidad?: string | null
      idServicio?: string | null
    },
    usuarioAuditoria: string,
    idEjecutor: string,
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
      idServicio: data.idServicio ?? null,
    })

    const guardada = await this.citaRepository(transaccion).save(cita)

    await this.historialRepository.crearHistorial(
      {
        idCita: guardada.id,
        idEjecutor,
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
    idEjecutor: string,
    transaccion: EntityManager
  ) {
    const detalleCambios = this.construirCambiosCita(cita, data)

    if (!detalleCambios.length) {
      return true
    }

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
        if (data.idServicio !== undefined) {
          patch.idServicio = data.idServicio
        }
      } else {
        patch.idServicio = null
      }
    }

    await this.citaRepository(transaccion).update(cita.id, {
      ...patch,
    })

    await this.historialRepository.crearHistorial(
      {
        idCita: cita.id,
        idEjecutor,
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
    idEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      const estadoAnterior = cita.estado
      if (estadoAnterior === dto.estado) {
        return true
      }
      cita.estado = dto.estado
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      await this.historialRepository.crearHistorial(
        {
          idCita: cita.id,
          idEjecutor,
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
    idEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      const estadoAnterior = cita.estado
      const fechaInicioAnterior = cita.fechaInicio
      const fechaFinAnterior = cita.fechaFin
      const nuevaFechaInicio = dayjs(dto.fechaInicio).toDate()
      const nuevaFechaFin = dto.fechaFin
      const nuevoEstado =
        CitasEstado.RECHAZADA === cita.estado
          ? CitasEstado.SOLICITADA
          : (cita.estado as CitasEstado)
      const detalleCambios: TipoActualizacion[] = []
      this.registrarCambio(
        detalleCambios,
        'fechaInicio',
        fechaInicioAnterior?.toISOString(),
        nuevaFechaInicio?.toISOString()
      )
      this.registrarCambio(
        detalleCambios,
        'fechaFin',
        fechaFinAnterior?.toISOString(),
        nuevaFechaFin?.toISOString()
      )
      this.registrarCambio(
        detalleCambios,
        'estado',
        estadoAnterior,
        nuevoEstado
      )
      this.registrarCambio(
        detalleCambios,
        'tipoCita',
        cita.tipoCita,
        dto.tipoCita ?? cita.tipoCita
      )
      this.registrarCambio(
        detalleCambios,
        'idServicio',
        cita.idServicio ?? undefined,
        dto.idServicio ?? cita.idServicio ?? undefined
      )

      if (!detalleCambios.length) {
        return true
      }

      cita.fechaInicio = nuevaFechaInicio
      cita.fechaFin = nuevaFechaFin
      cita.tipoCita = dto.tipoCita ?? cita.tipoCita
      cita.idServicio = dto.idServicio ?? cita.idServicio ?? null
      cita.estado = nuevoEstado
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      await this.historialRepository.crearHistorial(
        {
          idCita: cita.id,
          idEjecutor,
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
    idEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      const estadoAnterior = cita.estado
      if (estadoAnterior === CitasEstado.CANCELADA) {
        return true
      }
      cita.estado = CitasEstado.CANCELADA
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      await this.historialRepository.crearHistorial(
        {
          idCita: cita.id,
          idEjecutor,
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
    const cambios: TipoActualizacion[] = []

    this.registrarCambio(
      cambios,
      'detalle',
      cita.detalle,
      data.detalle ?? cita.detalle
    )
    this.registrarCambio(
      cambios,
      'fechaInicio',
      cita.fechaInicio?.toISOString(),
      data.fechaInicio?.toISOString()
    )
    this.registrarCambio(
      cambios,
      'fechaFin',
      cita.fechaFin?.toISOString(),
      data.fechaFin?.toISOString()
    )
    this.registrarCambio(
      cambios,
      'idMedico',
      cita.idMedico,
      data.idMedico ?? cita.idMedico
    )
    this.registrarCambio(
      cambios,
      'idPaciente',
      cita.idPaciente ?? undefined,
      data.idPaciente !== undefined
        ? (data.idPaciente ?? undefined)
        : (cita.idPaciente ?? undefined)
    )
    this.registrarCambio(
      cambios,
      'idConsultorio',
      cita.idConsultorio ?? undefined,
      data.idConsultorio !== undefined
        ? (data.idConsultorio ?? undefined)
        : (cita.idConsultorio ?? undefined)
    )
    this.registrarCambio(
      cambios,
      'idEspecialidad',
      cita.idEspecialidad ?? undefined,
      data.idEspecialidad !== undefined
        ? (data.idEspecialidad ?? undefined)
        : (cita.idEspecialidad ?? undefined)
    )
    this.registrarCambio(
      cambios,
      'idServicio',
      cita.idServicio ?? undefined,
      data.tipoCita === TipoCita.ESTUDIO
        ? (data.idServicio ?? cita.idServicio ?? undefined)
        : data.tipoCita === TipoCita.CONSULTA
          ? undefined
          : (cita.idServicio ?? undefined)
    )
    this.registrarCambio(
      cambios,
      'tipoCita',
      cita.tipoCita,
      data.tipoCita ?? cita.tipoCita
    )

    return cambios
  }

  private registrarCambio(
    cambios: TipoActualizacion[],
    field: string,
    before?: string,
    after?: string
  ) {
    if (before !== after) {
      cambios.push({ field, before, after })
    }
  }

  async marcarCitasVencidas(
    fechaCorte: Date,
    usuarioAuditoria: string,
    idEjecutor: string
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
          idEjecutor,
          comentario: 'Actualización automática por cita vencida',
          detalleCambios: [
            {
              field: 'estado',
              before: estadoAnterior,
              after: cita.estado,
            },
          ],
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

  async obtenerServicioPorId(idServicio: string, manager?: EntityManager) {
    const entityManager = manager ?? this.dataSource.manager
    return await entityManager
      .getRepository(Servicio)
      .createQueryBuilder('servicio')
      .leftJoinAndSelect('servicio.especialidad', 'especialidad')
      .where('servicio.id = :idServicio', { idServicio })
      .getOne()
  }
}
