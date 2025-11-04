import { BaseService } from '@/common/base/base-service'
import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { PacientesService } from '@/application/gestion-pacientes/services/pacientes.service'
import { CitasRepository } from '../repositories/citas.repository'
import {
  ActualizarCitaDto,
  AprobarCitaDto,
  CancelarCitaDto,
  CrearCitaDto,
  CrearCitaPacienteDto,
  HistorialCitaItemResponseDto,
  ReabrirCitaDto,
  RechazarCitaDto,
  ReprogramarCitaDto,
} from '../../gestion-pacientes/dto/citas.dto'
import { RolEnum, RolEnumId } from '@/core/authorization/rol.enum'
import { MedicosService } from './medicos.service'
import { Cita } from '../entities/cita.entity'
import { CitasEstado } from '../constant'
import {
  CitaDetalleResponse,
  CitaResponse,
} from '@/common/types/data-response.type'
import { formatearUsuarioRolRespuesta } from '../utils/formateos'
import { NotificacionService } from './notificacion.service'
import dayjs, { Dayjs } from 'dayjs'
import { NotificacionTipo } from '../entities/notificacion.entity'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { AsignacionService } from './asignacion.service'
import { HistorialCitaRepository } from '../repositories/historial-cita.repository'
import { Order } from '@/common/constants'

const REVERSION_VENTANA_DIAS = 7
const REVERSION_MAXIMA = 2
const REPROGRAMACIONES_RECHAZO_MAXIMAS = 2
const HORAS_CANCELACION_PACIENTE_CONFIRMADA = 24
const HORAS_REPROGRAMACION_PROFESIONAL = 2

@Injectable()
export class CitasService extends BaseService {
  constructor(
    @Inject(CitasRepository)
    private citasRepositorio: CitasRepository,
    private medicosService: MedicosService,
    @Inject(forwardRef(() => PacientesService))
    private pacientesService: PacientesService,
    private asignacionService: AsignacionService,
    private notificacionService: NotificacionService,
    private historialCitaRepositorio: HistorialCitaRepository
  ) {
    super()
  }

  private esPaciente(idRol: string) {
    return idRol === RolEnumId.PACIENTE
  }

  private esNutricionista(idRol: string) {
    return idRol === RolEnumId.NUTRICIONISTA
  }

  private esAdministrador(idRol: string) {
    return idRol === RolEnumId.ADMINISTRADOR
  }

  private obtenerNombreRol(idRol: string): string {
    switch (idRol) {
      case RolEnumId.ADMINISTRADOR:
        return RolEnum.ADMINISTRADOR
      case RolEnumId.NUTRICIONISTA:
        return RolEnum.NUTRICIONISTA
      case RolEnumId.PACIENTE:
        return RolEnum.PACIENTE
      default:
        return 'DESCONOCIDO'
    }
  }

  private async obtenerCitaExistente(
    idCita: string,
    transaccion?: EntityManager
  ) {
    const cita = await this.citasRepositorio.buscarPorId(idCita, transaccion)
    if (!cita) {
      throw new NotFoundException('Cita no encontrada')
    }
    return cita
  }

  private async guardarCita({
    cita,
    usuarioAuditoria,
    transaccion,
  }: {
    cita: Cita
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    await this.citasRepositorio.guardar({
      cita,
      usuarioAuditoria,
      transaccion,
    })
  }

  private async registrarHistorial({
    cita,
    estadoAnterior,
    estadoNuevo,
    comentario,
    idEjecutor,
    idRolEjecutor,
    usuarioAuditoria,
    transaccion,
  }: {
    cita: Cita
    estadoAnterior?: CitasEstado | null
    estadoNuevo: CitasEstado
    comentario?: string | null
    idEjecutor: string
    idRolEjecutor: string
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    await this.historialCitaRepositorio.registrarEvento({
      idCita: cita.id,
      estadoAnterior: estadoAnterior || null,
      estadoNuevo,
      comentario: comentario || null,
      rolEjecutor: this.obtenerNombreRol(idRolEjecutor),
      idEjecutor: idEjecutor,
      usuarioAuditoria,
      transaccion,
    })
  }

  private async notificarCambio({
    cita,
    tipo,
    mensaje,
    usuarioAuditoria,
    transaccion,
    incluirMedico = false,
  }: {
    cita: Cita
    tipo: NotificacionTipo
    mensaje: string
    usuarioAuditoria: string
    transaccion: EntityManager
    incluirMedico?: boolean
  }) {
    await this.notificacionService.crear({
      tipo,
      idPaciente: cita.idPaciente,
      idMedico: incluirMedico ? cita.idMedico : undefined,
      idCita: cita.id,
      mensaje,
      usuarioAuditoria,
      transaction: transaccion,
    })
  }

  private validarAccesoPaciente(cita: Cita, idUsuarioRol: string) {
    if (cita.idPaciente !== idUsuarioRol) {
      throw new ForbiddenException(
        'No tienes permisos para gestionar esta cita.'
      )
    }
  }

  private validarAccesoProfesional(
    cita: Cita,
    idUsuarioRol: string,
    esAdministrador: boolean
  ) {
    if (!esAdministrador && cita.idMedico !== idUsuarioRol) {
      throw new ForbiddenException(
        'No tienes permisos para gestionar esta cita.'
      )
    }
  }

  private actualizarVentanaReversion(cita: Cita) {
    if (!cita.reversionPendienteActualizadaEn) {
      return
    }

    const ultimaReversion = dayjs(cita.reversionPendienteActualizadaEn)
    if (dayjs().diff(ultimaReversion, 'day') > REVERSION_VENTANA_DIAS) {
      cita.reversionesPendiente = 0
      cita.reversionPendienteActualizadaEn = null
    }
  }

  private formatearFechaCita(cita: Cita) {
    return cita.fechaInicio
      ? dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')
      : 'una fecha pendiente'
  }

  async listarCitas({
    idUsuarioRol,
    idRol,
    fechaInicio,
    fechaFin,
  }: {
    idUsuarioRol: string
    idRol: string
    fechaInicio?: string
    fechaFin?: string
  }) {
    const fechaInicioParseada = fechaInicio ? dayjs(fechaInicio) : null
    const fechaFinParseada = fechaFin ? dayjs(fechaFin) : null

    if (fechaInicioParseada && !fechaInicioParseada.isValid()) {
      throw new BadRequestException('La fecha de inicio no es válida')
    }

    if (fechaFinParseada && !fechaFinParseada.isValid()) {
      throw new BadRequestException('La fecha fin no es válida')
    }

    let fechaInicioConsulta: Dayjs
    let fechaFinConsulta: Dayjs

    if (!fechaInicioParseada && !fechaFinParseada) {
      const ahora = dayjs()
      fechaInicioConsulta = ahora.startOf('month')
      fechaFinConsulta = ahora.endOf('month')
    } else {
      const fechaInicioBase = fechaInicioParseada || fechaFinParseada!
      const fechaFinBase = fechaFinParseada || fechaInicioParseada!
      fechaInicioConsulta = fechaInicioBase.startOf('day')
      fechaFinConsulta = fechaFinBase.endOf('day')
    }

    if (fechaInicioConsulta.isAfter(fechaFinConsulta)) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior o igual a la fecha fin'
      )
    }

    const fechaInicioBusqueda = fechaInicioConsulta.toDate()
    const fechaFinBusqueda = fechaFinConsulta.toDate()

    if (idRol === RolEnumId.PACIENTE) {
      const [citas, cantidad] = await this.citasRepositorio.listarPorPaciente({
        idUsuarioRol,
        fechaInicio: fechaInicioBusqueda,
        fechaFin: fechaFinBusqueda,
      })

      return [this.formatearCitas(citas), cantidad]
    } else if (idRol === RolEnumId.NUTRICIONISTA) {
      const [citas, cantidad] =
        await this.citasRepositorio.listarPorNutricionista({
          idUsuarioRol,
          fechaInicio: fechaInicioBusqueda,
          fechaFin: fechaFinBusqueda,
        })
      return [this.formatearCitas(citas), cantidad]
    }
    throw new ForbiddenException(
      'No tiene permiso para acceder a esta información'
    )
  }

  private validarRolListado(idRol: string) {
    const esAdmin = this.esAdministrador(idRol)
    const esNutricionista = this.esNutricionista(idRol)
    const esPaciente = this.esPaciente(idRol)

    if (!esAdmin && !esNutricionista && !esPaciente) {
      throw new ForbiddenException(
        'No tiene permiso para acceder a esta información'
      )
    }
  }

  private obtenerFechasDesdeRango({
    fechaInicio,
    fechaFin,
  }: {
    fechaInicio?: string
    fechaFin?: string
  }): { fechaInicioConsulta: Dayjs; fechaFinConsulta: Dayjs } {
    const fechaInicioParseada = fechaInicio ? dayjs(fechaInicio) : null
    const fechaFinParseada = fechaFin ? dayjs(fechaFin) : null

    if (fechaInicioParseada && !fechaInicioParseada.isValid()) {
      throw new BadRequestException('La fecha de inicio no es válida')
    }

    if (fechaFinParseada && !fechaFinParseada.isValid()) {
      throw new BadRequestException('La fecha fin no es válida')
    }

    let fechaInicioConsulta: Dayjs
    let fechaFinConsulta: Dayjs

    if (!fechaInicioParseada && !fechaFinParseada) {
      const ahora = dayjs()
      fechaInicioConsulta = ahora.startOf('month')
      fechaFinConsulta = ahora.endOf('month')
    } else {
      const fechaInicioBase = fechaInicioParseada || fechaFinParseada!
      const fechaFinBase = fechaFinParseada || fechaInicioParseada!
      fechaInicioConsulta = fechaInicioBase.startOf('day')
      fechaFinConsulta = fechaFinBase.endOf('day')
    }

    if (fechaInicioConsulta.isAfter(fechaFinConsulta)) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior o igual a la fecha fin'
      )
    }

    return { fechaInicioConsulta, fechaFinConsulta }
  }

  private obtenerFiltrosParticipantes({
    idRol,
    idPaciente,
    idMedico,
  }: {
    idRol: string
    idPaciente?: string
    idMedico?: string
  }): { idPaciente?: string; idMedico?: string } {
    if (this.esAdministrador(idRol)) {
      return { idPaciente, idMedico }
    }

    if (this.esNutricionista(idRol)) {
      if (idMedico) {
        throw new ForbiddenException(
          'El filtro por médico solo está disponible para administradores'
        )
      }
      return { idPaciente }
    }

    if (idPaciente || idMedico) {
      throw new ForbiddenException(
        'No tiene permiso para aplicar estos filtros'
      )
    }

    return {}
  }

  private obtenerCampoOrdenAgenda(orden?: string) {
    const mapaOrden: Record<string, string> = {
      fechaInicio: 'citas.fechaInicio',
      fechaFin: 'citas.fechaFin',
      estado: 'citas.estado',
      paciente: 'personaPaciente.nombres',
      medico: 'personaMedico.nombres',
    }
    if (!orden) {
      return 'citas.fechaInicio'
    }
    return mapaOrden[orden] || 'citas.fechaInicio'
  }

  async listarCitasPorRango({
    idUsuarioRol,
    idRol,
    fechaInicio,
    fechaFin,
    estados,
    idPaciente,
    idMedico,
  }: {
    idUsuarioRol: string
    idRol: string
    fechaInicio?: string
    fechaFin?: string
    estados?: CitasEstado[]
    idPaciente?: string
    idMedico?: string
  }): Promise<[CitaResponse[], number]> {
    this.validarRolListado(idRol)

    const { fechaInicioConsulta, fechaFinConsulta } =
      this.obtenerFechasDesdeRango({ fechaInicio, fechaFin })

    const filtrosParticipantes = this.obtenerFiltrosParticipantes({
      idRol,
      idPaciente,
      idMedico,
    })

    const [citas, total] = await this.citasRepositorio.listarPorRangoYRol({
      idRol,
      idUsuarioRol,
      fechaInicio: fechaInicioConsulta.toDate(),
      fechaFin: fechaFinConsulta.toDate(),
      estados,
      ...filtrosParticipantes,
    })

    return [this.formatearCitas(citas), total]
  }

  async listarAgendaCitas({
    idUsuarioRol,
    idRol,
    paginacion,
    fecha,
    estados,
    idPaciente,
    idMedico,
  }: {
    idUsuarioRol: string
    idRol: string
    paginacion: PaginacionQueryDto
    fecha?: string
    estados?: CitasEstado[]
    idPaciente?: string
    idMedico?: string
  }): Promise<[CitaResponse[], number]> {
    this.validarRolListado(idRol)

    let fechaInicioConsulta: Dayjs | undefined
    let fechaFinConsulta: Dayjs | undefined

    if (fecha) {
      const fechaReferencia = dayjs(fecha)
      if (!fechaReferencia.isValid()) {
        throw new BadRequestException('La fecha proporcionada no es válida')
      }

      fechaInicioConsulta = fechaReferencia.startOf('day')
      fechaFinConsulta = fechaReferencia.endOf('day')
    }

    const sentidoOrden = paginacion.orden ? paginacion.sentido : Order.DESC

    const filtrosParticipantes = this.obtenerFiltrosParticipantes({
      idRol,
      idPaciente,
      idMedico,
    })

    const [citas, total] =
      await this.citasRepositorio.listarAgendaPorRolPaginado({
        idRol,
        idUsuarioRol,
        fechaInicio: fechaInicioConsulta?.toDate(),
        fechaFin: fechaFinConsulta?.toDate(),
        estados,
        filtro: paginacion.filtro,
        limite: paginacion.limite || 10,
        saltar: paginacion.saltar,
        orden: this.obtenerCampoOrdenAgenda(paginacion.orden),
        sentido: sentidoOrden,
        ...filtrosParticipantes,
      })

    return [this.formatearCitas(citas), total]
  }

  async listarCitasPorPaciente({
    idPaciente,
    estado,
    transaccion,
  }: {
    idPaciente: string
    estado?: CitasEstado
    transaccion?: EntityManager
  }) {
    const [citas] = await this.citasRepositorio.listarPorPaciente({
      idUsuarioRol: idPaciente,
      estado,
      transaccion,
    })
    return citas
  }

  async crearCitaPaciente({
    idPaciente,
    idRol,
    idUsuarioRol,
    data,
    usuarioAuditoria,
  }: {
    idPaciente: string
    idRol: string
    idUsuarioRol: string
    data: CrearCitaPacienteDto
    usuarioAuditoria: string
  }): Promise<{ id: string }> {
    if (!this.esPaciente(idRol)) {
      throw new ForbiddenException(
        'Solo los pacientes pueden crear sus citas desde este endpoint.'
      )
    }

    if (idPaciente !== idUsuarioRol) {
      throw new ForbiddenException('No puedes crear citas para otro paciente.')
    }

    const resultado = await this.citasRepositorio.runTransaction(async (tx) => {
      const asignacion =
        await this.asignacionService.obtenerAsignacionActivaPorPaciente({
          idPaciente,
          transaccion: tx,
        })

      const cita = await this.citasRepositorio.crear({
        idMedico: asignacion.idMedico,
        data: {
          idPaciente,
          detalle: data.detalle,
          fechaFin: data.fechaFin,
          fechaInicio: data.fechaInicio,
        },
        usuarioAuditoria,
        transaccion: tx,
        estado: CitasEstado.BORRADOR,
        reprogramacionesDesdeRechazo: 0,
        reprogramacionesTotales: 0,
        reversionesPendiente: 0,
        reversionPendienteActualizadaEn: null,
      })

      await this.registrarHistorial({
        cita,
        estadoNuevo: cita.estado as CitasEstado,
        comentario: 'Cita creada por el paciente en borrador.',
        idRolEjecutor: idRol,
        idEjecutor: idUsuarioRol,
        usuarioAuditoria,
        transaccion: tx,
      })

      return { id: cita.id }
    })

    return resultado
  }

  async enviarCitaRevision({
    idCita,
    idRol,
    idUsuarioRol,
    usuarioAuditoria,
  }: {
    idCita: string
    idRol: string
    idUsuarioRol: string
    usuarioAuditoria: string
  }) {
    if (!this.esPaciente(idRol)) {
      throw new ForbiddenException('Solo los pacientes pueden enviar la cita.')
    }

    await this.citasRepositorio.runTransaction(async (tx) => {
      const cita = await this.obtenerCitaExistente(idCita, tx)
      this.validarAccesoPaciente(cita, idUsuarioRol)

      if (cita.estado !== CitasEstado.BORRADOR) {
        throw new PreconditionFailedException(
          'Solo se pueden enviar las citas que están en estado BORRADOR.'
        )
      }

      const estadoAnterior = cita.estado as CitasEstado
      cita.estado = CitasEstado.SOLICITADA

      await this.guardarCita({
        cita,
        usuarioAuditoria,
        transaccion: tx,
      })

      await this.registrarHistorial({
        cita,
        estadoAnterior,
        estadoNuevo: cita.estado as CitasEstado,
        comentario: 'El paciente envió la cita para revisión.',
        idRolEjecutor: idRol,
        idEjecutor: idUsuarioRol,
        transaccion: tx,
        usuarioAuditoria,
      })

      const mensaje = `Nueva solicitud de cita para el ${this.formatearFechaCita(
        cita
      )}.`

      await this.notificarCambio({
        cita,
        tipo: NotificacionTipo.CITA_SOLICITADA,
        mensaje,
        usuarioAuditoria,
        transaccion: tx,
        incluirMedico: true,
      })
    })
  }

  async cancelarCita({
    idCita,
    idRol,
    idUsuarioRol,
    usuarioAuditoria,
    data,
  }: {
    idCita: string
    idRol: string
    idUsuarioRol: string
    usuarioAuditoria: string
    data: CancelarCitaDto
  }) {
    await this.citasRepositorio.runTransaction(async (tx) => {
      const cita = await this.obtenerCitaExistente(idCita, tx)
      const esAdmin = this.esAdministrador(idRol)
      const esNutricionista = this.esNutricionista(idRol)
      const esPaciente = this.esPaciente(idRol)

      if (esPaciente) {
        this.validarAccesoPaciente(cita, idUsuarioRol)
        if (
          ![
            CitasEstado.BORRADOR,
            CitasEstado.SOLICITADA,
            CitasEstado.RECHAZADA,
            CitasEstado.CONFIRMADA,
          ].includes(cita.estado as CitasEstado)
        ) {
          throw new PreconditionFailedException(
            'La cita no se puede cancelar desde su estado actual.'
          )
        }

        if (cita.estado === CitasEstado.CONFIRMADA) {
          const horasRestantes = dayjs(cita.fechaInicio).diff(dayjs(), 'hour')
          if (horasRestantes < HORAS_CANCELACION_PACIENTE_CONFIRMADA) {
            throw new PreconditionFailedException(
              'Solo puedes cancelar citas confirmadas con al menos 24 horas de anticipación.'
            )
          }
        }
      } else if (esNutricionista || esAdmin) {
        this.validarAccesoProfesional(cita, idUsuarioRol, esAdmin)
      } else {
        throw new ForbiddenException(
          'No tienes permisos para cancelar la cita.'
        )
      }

      const estadoAnterior = cita.estado as CitasEstado
      cita.estado = CitasEstado.CANCELADA
      cita.lockedAt = null

      await this.guardarCita({
        cita,
        usuarioAuditoria,
        transaccion: tx,
      })

      await this.registrarHistorial({
        cita,
        estadoAnterior,
        estadoNuevo: cita.estado as CitasEstado,
        comentario: data.motivo,
        idRolEjecutor: idRol,
        idEjecutor: idUsuarioRol,
        usuarioAuditoria,
        transaccion: tx,
      })

      const mensaje = `La cita programada para el ${this.formatearFechaCita(
        cita
      )} fue cancelada. Motivo: ${data.motivo}`

      await this.notificarCambio({
        cita,
        tipo: NotificacionTipo.CITA_CANCELADA,
        mensaje,
        usuarioAuditoria,
        transaccion: tx,
        incluirMedico: true,
      })
    })
  }

  async reabrirCita({
    idCita,
    idRol,
    idUsuarioRol,
    usuarioAuditoria,
    data,
  }: {
    idCita: string
    idRol: string
    idUsuarioRol: string
    usuarioAuditoria: string
    data: ReabrirCitaDto
  }) {
    if (!this.esPaciente(idRol)) {
      throw new ForbiddenException('Solo el paciente puede reabrir la cita.')
    }

    await this.citasRepositorio.runTransaction(async (tx) => {
      const cita = await this.obtenerCitaExistente(idCita, tx)
      this.validarAccesoPaciente(cita, idUsuarioRol)

      const estadoAnterior = cita.estado as CitasEstado

      if (estadoAnterior === CitasEstado.SOLICITADA) {
        this.actualizarVentanaReversion(cita)
        const reversionesActuales = cita.reversionesPendiente || 0
        if (reversionesActuales >= REVERSION_MAXIMA) {
          throw new PreconditionFailedException(
            'Has superado el número máximo de reversiones permitidas en la última semana.'
          )
        }
        cita.reversionesPendiente = reversionesActuales + 1
        cita.reversionPendienteActualizadaEn = new Date()
      } else if (estadoAnterior === CitasEstado.RECHAZADA) {
        const reprogramacionesActuales = cita.reprogramacionesDesdeRechazo || 0
        if (reprogramacionesActuales >= REPROGRAMACIONES_RECHAZO_MAXIMAS) {
          throw new PreconditionFailedException(
            'Debes crear una nueva cita, alcanzaste el máximo de reprogramaciones tras el rechazo.'
          )
        }
        cita.reprogramacionesDesdeRechazo = reprogramacionesActuales + 1
      } else {
        throw new PreconditionFailedException(
          'Solo se pueden reabrir citas pendientes o rechazadas.'
        )
      }

      cita.estado = CitasEstado.BORRADOR
      cita.lockedAt = null

      await this.guardarCita({
        cita,
        usuarioAuditoria,
        transaccion: tx,
      })

      await this.registrarHistorial({
        cita,
        estadoAnterior,
        estadoNuevo: cita.estado as CitasEstado,
        comentario:
          data.comentario ||
          'El paciente reabrió la cita para realizar ajustes.',
        idRolEjecutor: idRol,
        idEjecutor: idUsuarioRol,
        usuarioAuditoria,
        transaccion: tx,
      })
    })
  }

  async aprobarCita({
    idCita,
    idRol,
    idUsuarioRol,
    usuarioAuditoria,
    data,
  }: {
    idCita: string
    idRol: string
    idUsuarioRol: string
    usuarioAuditoria: string
    data: AprobarCitaDto
  }) {
    if (!this.esNutricionista(idRol) && !this.esAdministrador(idRol)) {
      throw new ForbiddenException(
        'Solo los nutricionistas o administradores pueden aprobar citas.'
      )
    }

    await this.citasRepositorio.runTransaction(async (tx) => {
      const cita = await this.obtenerCitaExistente(idCita, tx)
      this.validarAccesoProfesional(
        cita,
        idUsuarioRol,
        this.esAdministrador(idRol)
      )

      if (cita.estado !== CitasEstado.SOLICITADA) {
        throw new PreconditionFailedException(
          'Solo se pueden aprobar citas que estén solicitadas.'
        )
      }

      const estadoAnterior = cita.estado as CitasEstado
      cita.estado = CitasEstado.CONFIRMADA
      cita.lockedAt = new Date()
      cita.comentarioNutricionista = data.comentario || null
      cita.reprogramacionesDesdeRechazo = 0

      await this.guardarCita({
        cita,
        usuarioAuditoria,
        transaccion: tx,
      })

      await this.registrarHistorial({
        cita,
        estadoAnterior,
        estadoNuevo: cita.estado as CitasEstado,
        comentario: data.comentario || 'Cita confirmada por el nutricionista.',
        idRolEjecutor: idRol,
        idEjecutor: idUsuarioRol,
        usuarioAuditoria,
        transaccion: tx,
      })

      const mensaje = `Tu cita del ${this.formatearFechaCita(
        cita
      )} fue confirmada.`

      await this.notificarCambio({
        cita,
        tipo: NotificacionTipo.CITA_CONFIRMADA,
        mensaje,
        usuarioAuditoria,
        transaccion: tx,
        incluirMedico: this.esAdministrador(idRol),
      })
    })
  }

  async rechazarCita({
    idCita,
    idRol,
    idUsuarioRol,
    usuarioAuditoria,
    data,
  }: {
    idCita: string
    idRol: string
    idUsuarioRol: string
    usuarioAuditoria: string
    data: RechazarCitaDto
  }) {
    if (!this.esNutricionista(idRol) && !this.esAdministrador(idRol)) {
      throw new ForbiddenException(
        'Solo los nutricionistas o administradores pueden rechazar citas.'
      )
    }

    await this.citasRepositorio.runTransaction(async (tx) => {
      const cita = await this.obtenerCitaExistente(idCita, tx)
      this.validarAccesoProfesional(
        cita,
        idUsuarioRol,
        this.esAdministrador(idRol)
      )

      if (cita.estado !== CitasEstado.SOLICITADA) {
        throw new PreconditionFailedException(
          'Solo se pueden rechazar citas que estén solicitadas.'
        )
      }

      const estadoAnterior = cita.estado as CitasEstado
      cita.estado = CitasEstado.RECHAZADA
      cita.lockedAt = null
      cita.comentarioNutricionista = data.comentario
      cita.reprogramacionesDesdeRechazo = 0

      await this.guardarCita({
        cita,
        usuarioAuditoria,
        transaccion: tx,
      })

      await this.registrarHistorial({
        cita,
        estadoAnterior,
        estadoNuevo: cita.estado as CitasEstado,
        comentario: data.comentario,
        idRolEjecutor: idRol,
        idEjecutor: idUsuarioRol,
        usuarioAuditoria,
        transaccion: tx,
      })

      const mensaje = `Tu cita del ${this.formatearFechaCita(
        cita
      )} fue rechazada. Motivo: ${data.comentario}`

      await this.notificarCambio({
        cita,
        tipo: NotificacionTipo.CITA_RECHAZADA,
        mensaje,
        usuarioAuditoria,
        transaccion: tx,
      })
    })
  }

  async reprogramarCita({
    idCita,
    idRol,
    idUsuarioRol,
    usuarioAuditoria,
    data,
  }: {
    idCita: string
    idRol: string
    idUsuarioRol: string
    usuarioAuditoria: string
    data: ReprogramarCitaDto
  }) {
    if (!this.esNutricionista(idRol) && !this.esAdministrador(idRol)) {
      throw new ForbiddenException(
        'Solo los nutricionistas o administradores pueden reprogramar citas.'
      )
    }

    await this.citasRepositorio.runTransaction(async (tx) => {
      const cita = await this.obtenerCitaExistente(idCita, tx)
      const esAdmin = this.esAdministrador(idRol)
      this.validarAccesoProfesional(cita, idUsuarioRol, esAdmin)

      if (cita.estado !== CitasEstado.CONFIRMADA) {
        throw new PreconditionFailedException(
          'Solo se pueden reprogramar citas aprobadas.'
        )
      }

      if (!esAdmin) {
        const horasRestantes = dayjs(cita.fechaInicio).diff(dayjs(), 'hour')
        if (horasRestantes < HORAS_REPROGRAMACION_PROFESIONAL) {
          throw new PreconditionFailedException(
            'Solo puedes reprogramar con al menos 2 horas de anticipación.'
          )
        }
      }

      const estadoAnterior = cita.estado as CitasEstado
      cita.fechaInicio = data.fechaInicio
      cita.fechaFin = data.fechaFin
      cita.comentarioNutricionista = data.comentario
      cita.reprogramacionesTotales = (cita.reprogramacionesTotales || 0) + 1
      cita.lockedAt = new Date()

      await this.guardarCita({
        cita,
        usuarioAuditoria,
        transaccion: tx,
      })

      await this.registrarHistorial({
        cita,
        estadoAnterior,
        estadoNuevo: cita.estado as CitasEstado,
        comentario: data.comentario,
        idRolEjecutor: idRol,
        idEjecutor: idUsuarioRol,
        usuarioAuditoria,
        transaccion: tx,
      })

      const mensaje = `Tu cita fue reprogramada para el ${this.formatearFechaCita(
        cita
      )}. Motivo: ${data.comentario}`

      await this.notificarCambio({
        cita,
        tipo: NotificacionTipo.CITA_REPROGRAMADA,
        mensaje,
        usuarioAuditoria,
        transaccion: tx,
      })
    })
  }

  // async crearCitaConfirmada({
  //   idProfesional,
  //   idRol,
  //   idUsuarioRol,
  //   data,
  //   usuarioAuditoria,
  // }: {
  //   idProfesional: string
  //   idRol: string
  //   idUsuarioRol: string
  //   data: CrearCitaDto
  //   usuarioAuditoria: string
  // }): Promise<{ id: string }> {
  //   if (!this.esNutricionista(idRol) && !this.esAdministrador(idRol)) {
  //     throw new ForbiddenException(
  //       'Solo nutricionistas o administradores pueden crear citas confirmadas.'
  //     )
  //   }

  //   const esAdmin = this.esAdministrador(idRol)
  //   if (!esAdmin && idProfesional !== idUsuarioRol) {
  //     throw new ForbiddenException(
  //       'No puedes crear citas confirmadas para otros profesionales.'
  //     )
  //   }

  //   const idMedico = esAdmin ? idProfesional : idUsuarioRol

  //   return await this.citasRepositorio.runTransaction(async (tx) => {
  //     await this.medicosService.obtenerMedico(idMedico, tx)
  //     await this.pacientesService.obtenerPaciente(data.idPaciente, tx)

  //     if (!esAdmin) {
  //       await this.asignacionService.validarAsignacion({
  //         idMedico,
  //         idPaciente: data.idPaciente,
  //         transaccion: tx,
  //       })
  //     }

  //     const cita = await this.citasRepositorio.crear({
  //       idMedico,
  //       data,
  //       usuarioAuditoria,
  //       transaccion: tx,
  //       estado: CitasEstado.APROBADA,
  //       lockedAt: new Date(),
  //       comentarioNutricionista: data.detalle,
  //       reprogramacionesDesdeRechazo: 0,
  //       reprogramacionesTotales: 0,
  //       reversionesPendiente: 0,
  //       reversionPendienteActualizadaEn: null,
  //     })

  //     await this.registrarHistorial({
  //       cita,
  //       estadoNuevo: cita.estado as CitasEstado,
  //       comentario: 'Cita confirmada directamente por el profesional.',
  //       idRolEjecutor: idRol,
  //       usuarioAuditoria,
  //       transaccion: tx,
  //     })

  //     const mensaje = `Se confirmó una cita para el ${this.formatearFechaCita(
  //       cita
  //     )}.`

  //     await this.notificarCambio({
  //       cita,
  //       tipo: NotificacionTipo.CITA_CONFIRMADA,
  //       mensaje,
  //       usuarioAuditoria,
  //       transaccion: tx,
  //     })

  //     return { id: cita.id }
  //   })
  // }

  async obtenerDetalleCita({
    idCita,
    idRol,
    idUsuarioRol,
  }: {
    idCita: string
    idRol: string
    idUsuarioRol: string
  }): Promise<CitaDetalleResponse> {
    const cita = await this.citasRepositorio.buscarDetallePorId(idCita)

    if (!cita) {
      throw new NotFoundException('Cita no encontrada')
    }

    if (this.esPaciente(idRol)) {
      this.validarAccesoPaciente(cita, idUsuarioRol)
    } else if (this.esNutricionista(idRol)) {
      this.validarAccesoProfesional(cita, idUsuarioRol, false)
    } else if (!this.esAdministrador(idRol)) {
      throw new ForbiddenException('No tienes permisos para ver la cita.')
    }

    return this.formatearDetalleCita(cita)
  }

  async obtenerHistorialCita({
    idCita,
    idRol,
    idUsuarioRol,
  }: {
    idCita: string
    idRol: string
    idUsuarioRol: string
  }): Promise<HistorialCitaItemResponseDto[]> {
    const cita = await this.obtenerCitaExistente(idCita)

    if (this.esPaciente(idRol)) {
      this.validarAccesoPaciente(cita, idUsuarioRol)
    } else if (this.esNutricionista(idRol)) {
      this.validarAccesoProfesional(cita, idUsuarioRol, false)
    } else if (!this.esAdministrador(idRol)) {
      throw new ForbiddenException(
        'No tienes permisos para ver el historial de la cita.'
      )
    }

    const historial = await this.historialCitaRepositorio.listarPorCita({
      idCita,
    })

    return historial.map((registro) => ({
      id: registro.id,
      estadoAnterior: (registro.estadoAnterior || null) as CitasEstado | null,
      estado: registro.estado as CitasEstado,
      comentario: registro.comentario || null,
      rolEjecutor: registro.rolEjecutor,
      usuarioEjecutor: formatearUsuarioRolRespuesta(registro.usuarioEjecutor),
      fechaCreacion: registro.fechaCreacion,
    }))
  }

  async actualizarCitaPaciente({
    idCita,
    idRol,
    idUsuarioRol,
    usuarioAuditoria,
    data,
  }: {
    idCita: string
    idRol: string
    idUsuarioRol: string
    usuarioAuditoria: string
    data: ActualizarCitaDto
  }) {
    if (!this.esPaciente(idRol)) {
      throw new ForbiddenException('Solo el paciente puede editar la cita.')
    }

    await this.citasRepositorio.runTransaction(async (tx) => {
      const cita = await this.obtenerCitaExistente(idCita, tx)
      this.validarAccesoPaciente(cita, idUsuarioRol)

      if (
        ![CitasEstado.BORRADOR, CitasEstado.RECHAZADA].includes(
          cita.estado as CitasEstado
        )
      ) {
        throw new PreconditionFailedException(
          'Solo se pueden editar citas en estado BORRADOR o RECHAZADA.'
        )
      }

      if (data.fechaInicio) {
        cita.fechaInicio = data.fechaInicio
      }
      if (data.fechaFin) {
        cita.fechaFin = data.fechaFin
      }
      if (data.detalle) {
        cita.detalle = data.detalle
      }

      await this.guardarCita({
        cita,
        usuarioAuditoria,
        transaccion: tx,
      })

      await this.registrarHistorial({
        cita,
        estadoAnterior: cita.estado as CitasEstado,
        estadoNuevo: cita.estado as CitasEstado,
        comentario: 'El paciente actualizó los detalles de la cita.',
        idRolEjecutor: idRol,
        usuarioAuditoria,
        idEjecutor: idUsuarioRol,
        transaccion: tx,
      })
    })
  }

  async crearCita({
    data,
    idRol,
    idUsuarioRol,
    usuarioAuditoria,
    transaccion,
  }: {
    data: CrearCitaDto
    idRol: string
    idUsuarioRol: string
    usuarioAuditoria: string
    transaccion?: EntityManager
  }): Promise<{ id: string }> {
    if (this.esPaciente(idRol)) {
      return this.crearCitaPaciente({
        idPaciente: idUsuarioRol,
        idRol,
        idUsuarioRol,
        usuarioAuditoria,
        data: {
          detalle: data.detalle,
          fechaFin: data.fechaFin,
          fechaInicio: data.fechaInicio,
        },
      })
    }

    if (!this.esNutricionista(idRol) && !this.esAdministrador(idRol)) {
      throw new ForbiddenException(
        'Solo los administradores, nutricionistas o pacientes pueden crear citas.'
      )
    }

    if (!data.idPaciente) {
      throw new BadRequestException(
        'El identificador del paciente es obligatorio.'
      )
    }

    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearCita({
          data,
          idRol,
          idUsuarioRol,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }

      return await this.citasRepositorio.runTransaction(op)
    }

    await this.pacientesService.obtenerPaciente(data.idPaciente, transaccion)

    const esAdmin = this.esAdministrador(idRol)

    let idMedico = idUsuarioRol

    if (esAdmin) {
      const asignacion =
        await this.asignacionService.obtenerAsignacionActivaPorPaciente({
          idPaciente: data.idPaciente,
          transaccion,
        })
      idMedico = asignacion.idMedico
    } else {
      await this.asignacionService.validarAsignacion({
        idMedico,
        idPaciente: data.idPaciente,
        transaccion,
      })
    }

    await this.medicosService.obtenerMedico(idMedico, transaccion)

    const cita = await this.citasRepositorio.crear({
      idMedico,
      data,
      usuarioAuditoria,
      transaccion,
      estado: CitasEstado.CONFIRMADA,
      lockedAt: new Date(),
      comentarioNutricionista: data.detalle,
      reprogramacionesDesdeRechazo: 0,
      reprogramacionesTotales: 0,
      reversionesPendiente: 0,
      reversionPendienteActualizadaEn: null,
    })

    await this.registrarHistorial({
      cita,
      estadoNuevo: cita.estado as CitasEstado,
      comentario: esAdmin
        ? 'Cita confirmada directamente por el administrador.'
        : 'Cita confirmada directamente por el nutricionista.',
      idRolEjecutor: idRol,
      usuarioAuditoria,
      idEjecutor: idUsuarioRol,
      transaccion,
    })

    const mensaje = `Se confirmó una cita para el ${this.formatearFechaCita(cita)}.`

    await this.notificarCambio({
      cita,
      tipo: NotificacionTipo.CITA_CONFIRMADA,
      mensaje,
      usuarioAuditoria,
      transaccion,
      incluirMedico: esAdmin,
    })

    return { id: cita.id }
  }

  async actualizarCita({
    idCita,
    data,
    idMedico,
    idUsuarioRol,
    usuarioAuditoria,
    transaccion,
  }: {
    idCita: string
    idMedico: string
    data: ActualizarCitaDto
    idUsuarioRol: string
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarCita({
          idCita,
          data,
          idMedico,
          idUsuarioRol,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }

      return await this.citasRepositorio.runTransaction(op)
    }

    const cita = await this.obtenerCitaExistente(idCita, transaccion)

    if (idMedico !== cita.idMedico) {
      throw new ForbiddenException(
        'No tiene permiso para acceder a esta información'
      )
    }

    const { idPaciente, detalle, fechaFin, fechaInicio, estado } = data

    if (idPaciente && idPaciente !== cita.idPaciente) {
      await this.pacientesService.obtenerPaciente(idPaciente, transaccion)
      cita.idPaciente = idPaciente
    }

    if (detalle) {
      cita.detalle = detalle
    }

    if (fechaInicio) {
      cita.fechaInicio = fechaInicio
    }

    if (fechaFin) {
      cita.fechaFin = fechaFin
    }

    const estadoAnterior = cita.estado as CitasEstado
    if (estado) {
      if (![CitasEstado.COMPLETADA, CitasEstado.NO_ASISTIO].includes(estado)) {
        throw new BadRequestException(
          'El estado solo puede cambiarse a COMPLETADA o NO_ASISTIO desde este método.'
        )
      }
      cita.estado = estado
    }

    await this.guardarCita({
      cita,
      usuarioAuditoria,
      transaccion,
    })

    if (estado && estado !== estadoAnterior) {
      await this.registrarHistorial({
        cita,
        estadoAnterior,
        estadoNuevo: estado,
        comentario:
          estado === CitasEstado.COMPLETADA
            ? 'La cita fue marcada como completada.'
            : 'La cita fue marcada como no asistida.',
        idRolEjecutor: RolEnumId.NUTRICIONISTA,
        usuarioAuditoria,
        idEjecutor: idMedico,
        transaccion,
      })
    }

    return cita
  }

  async buscarPorId(id: string, transaccion?: EntityManager) {
    const cita = await this.citasRepositorio.buscarPorId(id, transaccion)
    if (!cita) {
      throw new NotFoundException('Cita no encontrada')
    }
    return cita
  }

  async eliminarCita({
    id,
    idMedico,
    usuarioAuditoria,
    transaccion,
  }: {
    id: string
    idMedico: string
    usuarioAuditoria: string
    transaccion?: EntityManager
  }): Promise<void> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.eliminarCita({
          id,
          idMedico,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }

      return await this.citasRepositorio.runTransaction(op)
    }

    const cita = await this.citasRepositorio.buscarPorId(id, transaccion)
    if (!cita) {
      throw new NotFoundException('Cita no encontrada')
    }
    if (idMedico !== cita.idMedico) {
      throw new ForbiddenException(
        'No tiene permiso para acceder a esta información'
      )
    }
    await this.citasRepositorio.actualizar({
      datosDto: { estado: CitasEstado.INACTIVO },
      id,
      usuarioAuditoria: idMedico,
    })
  }

  async revisarCita(
    usuarioAuditoria: string,
    idUsuarioRol: string,
    transaccion?: EntityManager
  ) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.revisarCita(
          usuarioAuditoria,
          idUsuarioRol,
          nuevaTransaccion
        )
      }
      return await this.citasRepositorio.runTransaction(op)
    }
    const citas = await this.citasRepositorio.listarCitasPendientes(transaccion)
    const ahora = dayjs()
    this.logger.info(`Revisando ${citas.length} citas pendientes`)
    const pasadas: Cita[] = []
    const proximas: Cita[] = []
    for (const cita of citas) {
      const fechaCita = dayjs(cita.fechaInicio)
      if (fechaCita.isBefore(ahora)) {
        pasadas.push(cita)
      } else if (fechaCita.diff(ahora, 'hour') <= 48) {
        proximas.push(cita)
      }
    }
    this.logger.info(`Citas pasadas: ${pasadas.length},`)
    if (pasadas.length > 0) {
      this.logger.info(
        `Hay ${pasadas.length} citas pasadas que no han sido atendidas`
      )
      for (const cita of pasadas) {
        await this.notificacionService.crear({
          idPaciente: cita.idPaciente,
          idMedico: cita.idMedico,
          tipo: NotificacionTipo.CITA_NO_ASISTIO,
          mensaje: `La cita programada para el ${dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')} no ha sido atendida, por favor, comuníquese con el médico para reprogramar.`,
          transaction: transaccion,
          usuarioAuditoria: usuarioAuditoria,
        })
        await this.actualizarCita({
          idCita: cita.id,
          data: { estado: CitasEstado.NO_ASISTIO },
          usuarioAuditoria: cita.idMedico,
          idUsuarioRol,
          idMedico: cita.idMedico,
        })
      }
    }
    if (proximas.length > 0) {
      this.logger.info(
        `Hay ${proximas.length} citas próximas que deben ser notificadas`
      )
      for (const cita of proximas) {
        const notificacion = cita.notificacion.find(
          (notificacion) =>
            notificacion.tipo === NotificacionTipo.CITA_PROXIMAMENTE
        )
        if (!notificacion)
          await this.notificacionService.crear({
            idPaciente: cita.idPaciente,
            idMedico: cita.idMedico,
            usuarioAuditoria: usuarioAuditoria,
            tipo: NotificacionTipo.CITA_PROXIMAMENTE,
            mensaje: `La cita programada para el ${dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')} está próxima, por favor, tome en cuenta la fecha y hora.`,
            transaction: transaccion,
          })
      }
    }
  }

  async obtenerCitasPorPacientePaginado({
    idPaciente,
    paginacion,
  }: {
    idPaciente: string
    paginacion: PaginacionQueryDto
  }): Promise<[CitaResponse[], number]> {
    const [citas, total] =
      await this.citasRepositorio.listarPorPacientePaginado({
        idPaciente,
        paginacion,
      })
    return [this.formatearCitas(citas), total]
  }

  formatearCitas(citas: Cita[]) {
    return citas.map((cita) => this.formatearRespuestaCita(cita))
  }

  formatearRespuestaCita(cita: Cita): CitaResponse {
    return {
      id: cita.id,
      detalle: cita.detalle,
      fechaInicio: cita.fechaInicio,
      fechaFin: cita.fechaFin,
      estado: cita.estado,
      paciente: formatearUsuarioRolRespuesta(cita.paciente),
      medico: cita.medico ? formatearUsuarioRolRespuesta(cita.medico) : null,
    }
  }

  private formatearDetalleCita(cita: Cita): CitaDetalleResponse {
    return {
      id: cita.id,
      detalle: cita.detalle,
      fechaInicio: cita.fechaInicio,
      fechaFin: cita.fechaFin,
      estado: cita.estado,
      paciente: cita.paciente
        ? formatearUsuarioRolRespuesta(cita.paciente)
        : null,
      medico: cita.medico ? formatearUsuarioRolRespuesta(cita.medico) : null,
      idPaciente: cita.idPaciente,
      idMedico: cita.idMedico,
      comentarioNutricionista: cita.comentarioNutricionista ?? null,
      lockedAt: cita.lockedAt ?? null,
      reversionesPendiente: cita.reversionesPendiente,
      reversionPendienteActualizadaEn:
        cita.reversionPendienteActualizadaEn ?? null,
      reprogramacionesDesdeRechazo: cita.reprogramacionesDesdeRechazo,
      reprogramacionesTotales: cita.reprogramacionesTotales,
      fechaCreacion: cita.fechaCreacion,
      fechaModificacion: cita.fechaModificacion ?? null,
    }
  }
}
