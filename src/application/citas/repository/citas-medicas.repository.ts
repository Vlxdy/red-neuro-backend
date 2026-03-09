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
import { Servicio } from '@/application/servicio/entities/servicio.entity'
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

  private construirMensajeCitaSolicitada(data: {
    asignadoPor?: string
    fechaInicio?: Date | null
    tipoCita?: TipoCita
    detalle?: string
    nombreServicio?: string | null
  }): string {
    const asignadoPor = data.asignadoPor || 'personal de salud'
    const fechaTexto = data.fechaInicio
      ? dayjs(data.fechaInicio).format('DD/MM/YYYY HH:mm')
      : 'hora por confirmar'
    const tipoTexto =
      data.tipoCita === TipoCita.ESTUDIO ? 'Estudio' : 'Consulta'
    const servicio = data.nombreServicio ? ` (${data.nombreServicio})` : ''
    const detalle = data.detalle ? ` Detalle: ${data.detalle}.` : ''

    return `${asignadoPor} te asignó una ${tipoTexto}${servicio} para ${fechaTexto}.${detalle}`
  }

  private construirMensajeNoAsistio(cita: Cita): string {
    const fechaTexto = cita.fechaInicio
      ? dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')
      : 'hora registrada'
    const tipoTexto =
      cita.tipoCita === TipoCita.ESTUDIO ? 'Estudio' : 'Consulta'
    const servicio = cita.servicio?.nombre ? ` (${cita.servicio.nombre})` : ''
    const detalle = cita.detalle ? ` Detalle: ${cita.detalle}.` : ''

    return `La ${tipoTexto}${servicio} programada para ${fechaTexto} fue marcada como no asistida.${detalle}`
  }

  buildCitasQuery(
    filtros: Partial<FiltrosCitaDto | FiltrosCitaPaginadoDto> = {},
    idUsuarioSolicitante?: string,
    manager?: EntityManager
  ): SelectQueryBuilder<Cita> {
    const query = this.citaRepository(manager)
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.personal', 'personal')
      .leftJoinAndSelect('personal.usuario', 'usuarioPersonal')
      .leftJoinAndSelect('usuarioPersonal.persona', 'personaPersonal')
      .leftJoinAndSelect(
        'personal.usuarioRolEspecialidades',
        'personalEspecialidad'
      )
      .leftJoinAndSelect(
        'personalEspecialidad.especialidad',
        'especialidadPersonal'
      )
      .leftJoinAndSelect('cita.paciente', 'paciente')
      .leftJoinAndSelect('cita.consultorio', 'consultorio')
      .leftJoinAndSelect('cita.lugar', 'lugar')
      .leftJoinAndSelect('cita.especialidad', 'especialidad')
      .leftJoinAndSelect('cita.servicio', 'servicio')
      .leftJoinAndSelect('cita.citaNueva', 'citaNueva')
      .leftJoinAndSelect('citaNueva.personal', 'citaNuevaPersonal')
      .leftJoinAndSelect(
        'citaNuevaPersonal.usuario',
        'citaNuevaUsuarioPersonal'
      )
      .leftJoinAndSelect(
        'citaNuevaUsuarioPersonal.persona',
        'citaNuevaPersonaPersonal'
      )
      .leftJoinAndSelect('citaNueva.paciente', 'citaNuevaPaciente')
      .leftJoinAndSelect('citaNueva.consultorio', 'citaNuevaConsultorio')
      .leftJoinAndSelect('citaNueva.lugar', 'citaNuevaLugar')
      .leftJoinAndSelect('citaNueva.especialidad', 'citaNuevaEspecialidad')
      .leftJoinAndSelect('citaNueva.servicio', 'citaNuevaServicio')
      .leftJoinAndSelect('cita.usuarioProgramo', 'usuarioProgramo')
      .leftJoinAndSelect('usuarioProgramo.usuario', 'usuarioProgramoUsuario')
      .leftJoinAndSelect(
        'usuarioProgramoUsuario.persona',
        'usuarioProgramoPersona'
      )
      .leftJoinAndSelect(
        'usuarioProgramo.usuarioRolEspecialidades',
        'usuarioProgramoEspecialidades'
      )
      .leftJoinAndSelect(
        'usuarioProgramoEspecialidades.especialidad',
        'usuarioProgramoEspecialidad'
      )
      .leftJoinAndSelect('cita.usuarioEnvio', 'usuarioEnvio')
      .leftJoinAndSelect('usuarioEnvio.usuario', 'usuarioEnvioUsuario')
      .leftJoinAndSelect('usuarioEnvioUsuario.persona', 'usuarioEnvioPersona')
      .leftJoinAndSelect(
        'usuarioEnvio.usuarioRolEspecialidades',
        'usuarioEnvioEspecialidades'
      )
      .leftJoinAndSelect(
        'usuarioEnvioEspecialidades.especialidad',
        'usuarioEnvioEspecialidad'
      )
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

    if (filtros.idPersonal) {
      query.andWhere('cita.idPersonal = :idPersonal', {
        idPersonal: filtros.idPersonal,
      })
    }

    if (filtros.idLugar) {
      query.andWhere('cita.idLugar = :idLugar', {
        idLugar: filtros.idLugar,
      })
    }

    const estadosRestringidos = [CitasEstado.BORRADOR, CitasEstado.RECHAZADA]

    if (filtros.estado) {
      query.andWhere('cita.estado = :estado', {
        estado: filtros.estado,
      })

      if (
        idUsuarioSolicitante &&
        estadosRestringidos.includes(filtros.estado)
      ) {
        query.andWhere('cita.idUsuarioProgramo = :idUsuarioSolicitante', {
          idUsuarioSolicitante,
        })
      }
    } else {
      query
        .andWhere('cita.estado != :estadoInactivo', {
          estadoInactivo: CitasEstado.INACTIVO,
        })
        .andWhere('cita.estado != :estadoReprogramada', {
          estadoReprogramada: CitasEstado.REPROGRAMADA,
        })

      if (idUsuarioSolicitante) {
        query.andWhere(
          '(cita.estado NOT IN (:...estadosRestringidos) OR cita.idUsuarioProgramo = :idUsuarioSolicitante)',
          {
            estadosRestringidos,
            idUsuarioSolicitante,
          }
        )
      }
    }

    return query
  }

  async listarCitas(filtros: FiltrosCitaDto, idUsuarioSolicitante?: string) {
    return await this.buildCitasQuery(filtros, idUsuarioSolicitante).getMany()
  }

  async listarCitasPaginadas(
    filtros: FiltrosCitaPaginadoDto,
    idUsuarioSolicitante?: string
  ) {
    const { limite, saltar } = filtros
    return await this.buildCitasQuery(filtros, idUsuarioSolicitante)
      .take(limite)
      .skip(saltar)
      .getManyAndCount()
  }

  async obtenerCantidadCitasPorDia(
    filtros: FiltrosCitaDto,
    idUsuarioSolicitante?: string
  ) {
    const query = this.citaRepository()
      .createQueryBuilder('cita')
      .select('DATE(cita.fechaInicio)', 'fecha')
      .addSelect('COUNT(cita.id)', 'cantidad')
      .where('DATE(cita.fechaInicio) >= :fechaInicio', {
        fechaInicio: filtros.fechaInicio,
      })
      .andWhere('DATE(cita.fechaInicio) <= :fechaFin', {
        fechaFin: filtros.fechaFin,
      })

    if (filtros.idPersonal) {
      query.andWhere('cita.idPersonal = :idPersonal', {
        idPersonal: filtros.idPersonal,
      })
    }

    if (filtros.idLugar) {
      query.andWhere('cita.idLugar = :idLugar', {
        idLugar: filtros.idLugar,
      })
    }

    const estadosRestringidos = [CitasEstado.BORRADOR, CitasEstado.RECHAZADA]

    if (filtros.estado) {
      query.andWhere('cita.estado = :estado', {
        estado: filtros.estado,
      })

      if (
        idUsuarioSolicitante &&
        estadosRestringidos.includes(filtros.estado)
      ) {
        query.andWhere('cita.idUsuarioProgramo = :idUsuarioSolicitante', {
          idUsuarioSolicitante,
        })
      }
    } else {
      query
        .andWhere('cita.estado != :estadoInactivo', {
          estadoInactivo: CitasEstado.INACTIVO,
        })
        .andWhere('cita.estado != :estadoReprogramada', {
          estadoReprogramada: CitasEstado.REPROGRAMADA,
        })

      if (idUsuarioSolicitante) {
        query.andWhere(
          '(cita.estado NOT IN (:...estadosRestringidos) OR cita.idUsuarioProgramo = :idUsuarioSolicitante)',
          {
            estadosRestringidos,
            idUsuarioSolicitante,
          }
        )
      }
    }

    return await query.groupBy('DATE(cita.fechaInicio)').getRawMany<{
      fecha: string
      cantidad: string
    }>()
  }

  async obtenerCitaConRelaciones(
    id: string,
    manager?: EntityManager,
    idUsuarioSolicitante?: string
  ) {
    return await this.buildCitasQuery({}, idUsuarioSolicitante, manager)
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
      idPersonal?: string
      idPaciente?: string | null
      idConsultorio?: string | null
      idLugar?: string | null
      idEspecialidad?: string | null
      idServicio?: string | null
      idCitaNueva?: string | null
      idHistorialCita?: string | null
      idUsuarioProgramo?: string | null
      idUsuarioEnvio?: string | null
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
      idPersonal: data.idPersonal,
      idPaciente: data.idPaciente ?? null,
      idConsultorio: data.idConsultorio ?? null,
      idLugar: data.idLugar ?? null,
      idEspecialidad: data.idEspecialidad ?? null,
      idServicio: data.idServicio ?? null,
      idCitaNueva: data.idCitaNueva ?? null,
      idHistorialCita: data.idHistorialCita ?? null,
      idUsuarioProgramo: data.idUsuarioProgramo ?? null,
      idUsuarioEnvio: data.idUsuarioEnvio ?? null,
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

    if (guardada.idPersonal && guardada.estado === CitasEstado.SOLICITADA) {
      const servicio = data.idServicio
        ? await this.obtenerServicioPorId(data.idServicio, transaccion)
        : null

      const notificacion = this.notificacionRepository(transaccion).create({
        tipo: NotificacionTipo.CITA_SOLICITADA,
        mensaje: this.construirMensajeCitaSolicitada({
          asignadoPor: 'Personal de salud',
          fechaInicio: guardada.fechaInicio,
          tipoCita: guardada.tipoCita,
          detalle: guardada.detalle,
          nombreServicio: servicio?.nombre ?? null,
        }),
        idCita: guardada.id,
        idPersonal: guardada.idPersonal,
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
    if (data.idPersonal !== undefined) patch.idPersonal = data.idPersonal
    if (data.idPaciente !== undefined) patch.idPaciente = data.idPaciente
    if (data.idConsultorio !== undefined)
      patch.idConsultorio = data.idConsultorio
    if (data.idLugar !== undefined) patch.idLugar = data.idLugar
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
      'idPersonal',
      cita.idPersonal,
      data.idPersonal ?? cita.idPersonal
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
      'idLugar',
      cita.idLugar ?? undefined,
      data.idLugar !== undefined
        ? (data.idLugar ?? undefined)
        : (cita.idLugar ?? undefined)
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
      const estadosElegibles = [CitasEstado.SOLICITADA, CitasEstado.CONFIRMADA]
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
          mensaje: this.construirMensajeNoAsistio(cita),
          idCita: cita.id,
          idPersonal: cita.idPersonal ?? null,
          usuarioCreacion: usuarioAuditoria,
        })
      )

      await this.notificacionRepository(manager).save(notificaciones)

      return citasConEstadoAnterior.length
    })
  }

  async guardarCita(cita: Cita, manager?: EntityManager) {
    return await this.citaRepository(manager).save(cita)
  }

  async crearHistorialAccion(
    data: {
      idCita: string
      idEjecutor: string
      comentario?: string | null
      detalleCambios?: TipoActualizacion[] | null
      usuarioCreacion: string
    },
    manager?: EntityManager
  ) {
    return await this.historialRepository.crearHistorial(data, manager)
  }

  async crearNotificacionSolicitada(
    data: {
      idCita: string
      idPersonal: string
      usuarioCreacion: string
      mensaje?: string
    },
    manager?: EntityManager
  ) {
    const notificacion = this.notificacionRepository(manager).create({
      tipo: NotificacionTipo.CITA_SOLICITADA,
      mensaje:
        data.mensaje ||
        'Tienes una cita asignada pendiente de confirmación en tu agenda.',
      idCita: data.idCita,
      idPersonal: data.idPersonal,
      usuarioCreacion: data.usuarioCreacion,
    })
    return await this.notificacionRepository(manager).save(notificacion)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }

  async obtenerServicioPorId(idServicio: string, manager?: EntityManager) {
    const entityManager = manager ?? this.dataSource.manager
    return await entityManager
      .getRepository(Servicio)
      .createQueryBuilder('servicio')
      .leftJoinAndSelect(
        'servicio.servicioEspecialidades',
        'servicioEspecialidades'
      )
      .leftJoinAndSelect('servicioEspecialidades.especialidad', 'especialidad')
      .where('servicio.id = :idServicio', { idServicio })
      .getOne()
  }
}
