import { BaseService } from '@/common/base'
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common'
import dayjs from 'dayjs'
import { randomUUID } from 'crypto'
import { Cron } from '@nestjs/schedule'
import {
  ActualizarCitaDto,
  ActualizarEstadoCitaDto,
  CancelarCitaDto,
  CantidadCitasPorDiaResponseDto,
  CitaResponseDto,
  CrearCitaDto,
  EditarBorradorCitaDto,
  EditarProgramadaCitaDto,
  EnviarCitaDto,
  FiltrosCitaDto,
  FiltrosCitaPaginadoDto,
  GrupoCitasPorFechaDto,
  MarcarNoAsistioCitaDto,
  MisResumenCitasDto,
  MisResumenResponseDto,
  MisSolicitadasQueryDto,
  MisSolicitadasResponseDto,
  MisTimelineQueryDto,
  MisTimelineResponseDto,
  HomeBandejaQueryDto,
  HomeBandejaResponseDto,
  HomeProgramadasListadoQueryDto,
  HomeGrupoDiaResponseDto,
  HomeListadoQueryDto,
  HomePreviewBloqueResponseDto,
  CitasScope,
  ProgramarControlCitaDto,
  RechazarCitaDto,
  ReprogramarCitaDto,
} from '../dto/cita.dto'

import { CitasMedicasRepository } from '../repository/citas-medicas.repository'
import { formatearCita, formatearCitas } from '../utils/formatear-citas'
import { EntityManager } from 'typeorm'
import { Cita } from '../entities/cita.entity'
import { CitasEstado, TipoCita } from '../constants'
import { RolEnum, RolEnumId } from '@/core/authorization/rol.enum'
import { NotificacionesRepository } from '../repository/notificaciones.repository'
import { DispositivosPushRepository } from '../repository/dispositivos-push.repository'
import { FirebasePushService } from '@/core/external-services/firebase/firebase-push.service'
import {
  construirEventoPushCita,
  construirMensajeNotificacionCita,
  EventoPushCita,
} from '../utils/notificacion-cita-messages'
import { CitasGateway } from '../gateways/citas.gateway'

@Injectable()
export class CitasMedicasService extends BaseService {
  constructor(
    @Inject(CitasMedicasRepository)
    private readonly citasRepository: CitasMedicasRepository,
    private readonly notificacionesRepository: NotificacionesRepository,
    private readonly dispositivosPushRepository: DispositivosPushRepository,
    private readonly firebasePushService: FirebasePushService,
    private readonly citasGateway: CitasGateway
  ) {
    super()
  }

  private calcularFechaFin(fechaInicio: Date, duracionMinutos: number): Date {
    return dayjs(fechaInicio).add(duracionMinutos, 'minute').toDate()
  }

  private async resolverServicio(
    idServicio: string,
    tipoCita: TipoCita,
    transaccion?: EntityManager
  ) {
    const servicio = await this.citasRepository.obtenerServicioPorId(
      idServicio,
      transaccion
    )

    if (!servicio) {
      throw new BadRequestException('El servicio seleccionado no existe')
    }

    if (servicio.tipo !== tipoCita) {
      throw new BadRequestException(
        'El servicio seleccionado no coincide con el tipo de cita'
      )
    }

    return servicio
  }

  private validarEstado(cita: Cita, estadosPermitidos: CitasEstado[]) {
    if (!estadosPermitidos.includes(cita.estado as CitasEstado)) {
      throw new BadRequestException(
        `La cita en estado ${cita.estado} no permite esta operación`
      )
    }
  }

  private crearDetalleCambiosEstado(
    before: CitasEstado,
    after: CitasEstado
  ): { field: string; before: string; after: string }[] {
    return [{ field: 'estado', before, after }]
  }

  private async resolverEstadoConAsignacion(
    idPersonal: string | null | undefined
  ): Promise<CitasEstado> {
    if (!idPersonal) {
      return CitasEstado.PROGRAMADA
    }

    const roles =
      await this.notificacionesRepository.obtenerRolesActivosUsuario(idPersonal)

    if (roles.includes(RolEnum.PROFESIONAL_INVITADO)) {
      return CitasEstado.SOLICITADA
    }

    return CitasEstado.PROGRAMADA
  }

  private validarCamposObligatoriosParaOperar(
    cita: Pick<Cita, 'idLugar' | 'idPersonal'>
  ) {
    if (!cita.idLugar) {
      throw new BadRequestException('El lugar es obligatorio')
    }

    if (!cita.idPersonal) {
      throw new BadRequestException('El personal asignado es obligatorio')
    }
  }

  private validarPermisoEdicionProgramada(
    rolEjecutor?: string,
    idEjecutor?: string
  ) {
    if (idEjecutor === '0') return
    if (![RolEnum.JEFE, RolEnum.COORDINADOR].includes(rolEjecutor as RolEnum)) {
      throw new ForbiddenException(
        'Solo jefes y coordinadores pueden modificar citas programadas'
      )
    }
  }

  private validarPermisoEdicionBorrador(cita: Cita, idEjecutor: string) {
    if (idEjecutor === '0') return
    if (cita.idUsuarioProgramo !== idEjecutor) {
      throw new ForbiddenException(
        'Solo el creador puede ver y editar citas en borrador'
      )
    }
  }

  private construirMensajeActualizacionCita(cita: Cita, accionador: string) {
    const servicio = cita.servicio?.nombre?.trim() || 'servicio no especificado'
    const fechaHora = cita.fechaInicio
      ? dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')
      : 'hora por confirmar'
    return `${accionador} modificó la cita de ${servicio} para ${fechaHora}.`
  }

  private async notificarCitaActualizada(
    citaAnterior: Cita,
    citaActualizada: Cita,
    usuarioAuditoria: string,
    idEjecutor: string,
    transaccion?: EntityManager
  ): Promise<void> {
    const accionador = await this.obtenerNombreAccionador(idEjecutor)
    const mensaje = this.construirMensajeActualizacionCita(
      citaActualizada,
      accionador
    )

    const destinatarios = new Set<string>()
    for (const id of [
      citaAnterior.idPersonal,
      citaActualizada.idPersonal,
      citaActualizada.idUsuarioProgramo,
      citaActualizada.idUsuarioEnvio,
    ]) {
      if (id && id !== idEjecutor) destinatarios.add(id)
    }

    await Promise.all(
      Array.from(destinatarios).map((idDestinatario) =>
        this.crearYEmitirNotificacionProgramada(
          {
            cita: citaActualizada,
            idDestinatario,
            mensaje,
            usuarioAuditoria,
          },
          transaccion
        )
      )
    )
  }

  private async obtenerNombreAccionador(idEjecutor: string): Promise<string> {
    return (
      (await this.notificacionesRepository.obtenerNombreCompletoUsuario(
        idEjecutor
      )) || 'Personal de salud'
    )
  }

  private construirMensajeProgramacionGeneral(
    cita: Cita,
    accionador: string
  ): string {
    const servicio = cita.servicio?.nombre?.trim() || 'servicio no especificado'
    const fechaHora = cita.fechaInicio
      ? dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')
      : 'hora por confirmar'

    return `${accionador} programó la cita de ${servicio} para ${fechaHora}.`
  }

  private construirMensajeProgramacionAsignado(
    cita: Cita,
    accionador: string
  ): string {
    const servicio = cita.servicio?.nombre?.trim() || 'servicio no especificado'
    const fechaHora = cita.fechaInicio
      ? dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')
      : 'hora por confirmar'

    return `${accionador} te asignó una cita de ${servicio} para ${fechaHora}.`
  }

  private construirMensajeControlProgramadoGeneral(
    cita: Cita,
    accionador: string
  ): string {
    const servicio = cita.servicio?.nombre?.trim() || 'servicio no especificado'
    const fechaHora = cita.fechaInicio
      ? dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')
      : 'hora por confirmar'

    return `${accionador} programó un control de ${servicio} para ${fechaHora}.`
  }

  private construirMensajeControlProgramadoAsignado(
    cita: Cita,
    accionador: string
  ): string {
    const servicio = cita.servicio?.nombre?.trim() || 'servicio no especificado'
    const fechaHora = cita.fechaInicio
      ? dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')
      : 'hora por confirmar'

    return `${accionador} te programó un control de ${servicio} para ${fechaHora}.`
  }

  private async crearYEmitirNotificacionProgramada(
    params: {
      cita: Cita
      idDestinatario: string
      mensaje: string
      usuarioAuditoria: string
    },
    transaccion?: EntityManager
  ) {
    const notificacion = await this.citasRepository.crearNotificacionProgramada(
      {
        idCita: params.cita.id,
        idPersonal: params.idDestinatario,
        usuarioCreacion: params.usuarioAuditoria,
        mensaje: params.mensaje,
      },
      transaccion
    )

    this.citasGateway.emitNuevaNotificacion(params.idDestinatario, {
      id: notificacion.id,
      tipo: notificacion.tipo,
      mensaje: notificacion.mensaje,
      visto: Boolean(notificacion.visto),
      idCita: notificacion.idCita,
      idPersonal: notificacion.idPersonal,
      fechaCreacion: notificacion.fechaCreacion,
    })
  }

  private async notificarCitaProgramada(
    cita: Cita,
    usuarioAuditoria: string,
    idEjecutor: string,
    transaccion?: EntityManager
  ): Promise<void> {
    if (cita.estado !== CitasEstado.PROGRAMADA) {
      return
    }

    const accionador = await this.obtenerNombreAccionador(idEjecutor)
    const eventoPush = construirEventoPushCita({
      evento: EventoPushCita.CITA_PROGRAMADA,
      citaId: cita.id,
    })

    const destinatariosRol =
      await this.notificacionesRepository.obtenerUsuariosActivosPorRoles([
        RolEnumId.JEFE,
        RolEnumId.COORDINADOR,
      ])

    const idsGenerales = Array.from(
      new Set(
        destinatariosRol
          .map((usuario) => usuario.id)
          .filter(
            (idUsuario) =>
              idUsuario !== idEjecutor && idUsuario !== cita.idPersonal
          )
      )
    )

    const mensajeGeneral = this.construirMensajeProgramacionGeneral(
      cita,
      accionador
    )

    await Promise.all(
      idsGenerales.map((idDestinatario) =>
        this.crearYEmitirNotificacionProgramada(
          {
            cita,
            idDestinatario,
            mensaje: mensajeGeneral,
            usuarioAuditoria,
          },
          transaccion
        )
      )
    )

    if (idsGenerales.length) {
      const tokensGenerales =
        await this.dispositivosPushRepository.listarTokensActivosPorUsuarios(
          idsGenerales
        )

      if (tokensGenerales.length) {
        await this.firebasePushService.sendToMany({
          tokens: tokensGenerales,
          title: eventoPush.title,
          body: mensajeGeneral,
          data: eventoPush.data,
        })
      }
    }

    if (cita.idPersonal && cita.idPersonal !== idEjecutor) {
      const mensajeAsignado = this.construirMensajeProgramacionAsignado(
        cita,
        accionador
      )

      await this.crearYEmitirNotificacionProgramada(
        {
          cita,
          idDestinatario: cita.idPersonal,
          mensaje: mensajeAsignado,
          usuarioAuditoria,
        },
        transaccion
      )

      const tokensAsignado =
        await this.dispositivosPushRepository.listarTokensActivosPorUsuarios([
          cita.idPersonal,
        ])

      if (tokensAsignado.length) {
        await this.firebasePushService.sendToMany({
          tokens: tokensAsignado,
          title: eventoPush.title,
          body: mensajeAsignado,
          data: eventoPush.data,
        })
      }
    }
  }

  private async crearYEmitirNotificacionControlProgramado(
    params: {
      cita: Cita
      idDestinatario: string
      mensaje: string
      usuarioAuditoria: string
    },
    transaccion?: EntityManager
  ) {
    const notificacion =
      await this.citasRepository.crearNotificacionControlProgramado(
        {
          idCita: params.cita.id,
          idPersonal: params.idDestinatario,
          usuarioCreacion: params.usuarioAuditoria,
          mensaje: params.mensaje,
        },
        transaccion
      )

    this.citasGateway.emitNuevaNotificacion(params.idDestinatario, {
      id: notificacion.id,
      tipo: notificacion.tipo,
      mensaje: notificacion.mensaje,
      visto: Boolean(notificacion.visto),
      idCita: notificacion.idCita,
      idPersonal: notificacion.idPersonal,
      fechaCreacion: notificacion.fechaCreacion,
    })
  }

  private async notificarControlProgramado(
    cita: Cita,
    usuarioAuditoria: string,
    idEjecutor: string,
    transaccion?: EntityManager
  ): Promise<void> {
    if (cita.estado !== CitasEstado.PROGRAMADA) {
      return
    }

    const accionador = await this.obtenerNombreAccionador(idEjecutor)
    const eventoPush = construirEventoPushCita({
      evento: EventoPushCita.CITA_CONTROL_PROGRAMADO,
      citaId: cita.id,
    })

    const destinatariosRol =
      await this.notificacionesRepository.obtenerUsuariosActivosPorRoles([
        RolEnumId.JEFE,
        RolEnumId.COORDINADOR,
      ])

    const idsGenerales = Array.from(
      new Set(
        destinatariosRol
          .map((usuario) => usuario.id)
          .filter(
            (idUsuario) =>
              idUsuario !== idEjecutor && idUsuario !== cita.idPersonal
          )
      )
    )

    const mensajeGeneral = this.construirMensajeControlProgramadoGeneral(
      cita,
      accionador
    )

    await Promise.all(
      idsGenerales.map((idDestinatario) =>
        this.crearYEmitirNotificacionControlProgramado(
          {
            cita,
            idDestinatario,
            mensaje: mensajeGeneral,
            usuarioAuditoria,
          },
          transaccion
        )
      )
    )

    if (idsGenerales.length) {
      const tokensGenerales =
        await this.dispositivosPushRepository.listarTokensActivosPorUsuarios(
          idsGenerales
        )

      if (tokensGenerales.length) {
        await this.firebasePushService.sendToMany({
          tokens: tokensGenerales,
          title: eventoPush.title,
          body: mensajeGeneral,
          data: eventoPush.data,
        })
      }
    }

    if (cita.idPersonal && cita.idPersonal !== idEjecutor) {
      const mensajeAsignado = this.construirMensajeControlProgramadoAsignado(
        cita,
        accionador
      )

      await this.crearYEmitirNotificacionControlProgramado(
        {
          cita,
          idDestinatario: cita.idPersonal,
          mensaje: mensajeAsignado,
          usuarioAuditoria,
        },
        transaccion
      )

      const tokensAsignado =
        await this.dispositivosPushRepository.listarTokensActivosPorUsuarios([
          cita.idPersonal,
        ])

      if (tokensAsignado.length) {
        await this.firebasePushService.sendToMany({
          tokens: tokensAsignado,
          title: eventoPush.title,
          body: mensajeAsignado,
          data: eventoPush.data,
        })
      }
    }
  }

  private async notificarCitaSolicitada(
    cita: Cita,
    usuarioAuditoria: string,
    idEjecutor: string,
    transaccion?: EntityManager
  ): Promise<void> {
    if (cita.estado !== CitasEstado.SOLICITADA) {
      return
    }

    const accionador = await this.obtenerNombreAccionador(idEjecutor)
    const mensaje = construirMensajeNotificacionCita({
      accionador,
      accion: 'ENVIADO',
      cita,
    })
    const eventoPush = construirEventoPushCita({
      evento: EventoPushCita.CITA_SOLICITADA,
      citaId: cita.id,
    })

    if (cita.idPersonal) {
      if (cita.idPersonal === idEjecutor) {
        return
      }

      const notificacion =
        await this.citasRepository.crearNotificacionSolicitada(
          {
            idCita: cita.id,
            idPersonal: cita.idPersonal,
            usuarioCreacion: usuarioAuditoria,
            mensaje,
          },
          transaccion
        )

      this.citasGateway.emitNuevaNotificacion(cita.idPersonal, {
        id: notificacion.id,
        tipo: notificacion.tipo,
        mensaje: notificacion.mensaje,
        visto: Boolean(notificacion.visto),
        idCita: notificacion.idCita,
        idPersonal: notificacion.idPersonal,
        fechaCreacion: notificacion.fechaCreacion,
      })

      const tokens =
        await this.dispositivosPushRepository.listarTokensActivosPorUsuarios([
          cita.idPersonal,
        ])

      if (tokens.length) {
        await this.firebasePushService.sendToMany({
          tokens,
          title: eventoPush.title,
          body: mensaje,
          data: eventoPush.data,
        })
      }

      return
    }

    const administradores =
      await this.notificacionesRepository.obtenerAdministradoresActivos()

    const destinatarios = administradores
      .map((admin) => admin.id)
      .filter((idAdmin) => idAdmin !== idEjecutor)

    if (!destinatarios.length) {
      return
    }

    const notificaciones = await Promise.all(
      destinatarios.map((idAdmin) =>
        this.citasRepository.crearNotificacionSolicitada(
          {
            idCita: cita.id,
            idPersonal: idAdmin,
            usuarioCreacion: usuarioAuditoria,
            mensaje,
          },
          transaccion
        )
      )
    )

    notificaciones.forEach((notificacion) => {
      if (!notificacion.idPersonal) return
      this.citasGateway.emitNuevaNotificacion(notificacion.idPersonal, {
        id: notificacion.id,
        tipo: notificacion.tipo,
        mensaje: notificacion.mensaje,
        visto: Boolean(notificacion.visto),
        idCita: notificacion.idCita,
        idPersonal: notificacion.idPersonal,
        fechaCreacion: notificacion.fechaCreacion,
      })
    })

    const tokens =
      await this.dispositivosPushRepository.listarTokensActivosPorUsuarios(
        destinatarios
      )

    if (tokens.length) {
      await this.firebasePushService.sendToMany({
        tokens,
        title: eventoPush.title,
        body: mensaje,
        data: eventoPush.data,
      })
    }
  }

  private aplicarRestriccionPorRolEnFiltros<T extends { idPersonal?: string }>(
    filtros: T,
    idUsuarioSolicitante?: string,
    rolSolicitante?: string
  ): T {
    if (
      rolSolicitante !== RolEnum.PROFESIONAL_INVITADO ||
      !idUsuarioSolicitante
    ) {
      return filtros
    }

    return {
      ...filtros,
      idPersonal: idUsuarioSolicitante,
    }
  }

  private resolverScope(
    scope: CitasScope | undefined,
    rol: string,
    idUsuario: string,
    idPersonal?: string
  ) {
    const puedeVerTodo = [RolEnum.ADMINISTRADOR, RolEnum.JEFE].includes(
      rol as RolEnum
    )
    const puedeVerPersonal = puedeVerTodo || rol === RolEnum.COORDINADOR

    if (!puedeVerPersonal || !scope || scope === CitasScope.MINE) {
      return { idPersonal: idUsuario, scopeAplicado: CitasScope.MINE }
    }

    if (scope === CitasScope.PERSONAL) {
      if (!idPersonal) {
        throw new BadRequestException(
          `idPersonal es requerido cuando scope=${CitasScope.PERSONAL}`
        )
      }

      return { idPersonal, scopeAplicado: CitasScope.PERSONAL }
    }

    if (scope === CitasScope.ALL) {
      return { idPersonal: undefined, scopeAplicado: CitasScope.ALL }
    }

    return { idPersonal: idUsuario, scopeAplicado: CitasScope.MINE }
  }

  private obtenerDesdePorDefecto(desde?: string): string {
    return desde
      ? dayjs(desde).toISOString()
      : dayjs().startOf('day').toISOString()
  }

  private parseCursor(
    cursor?: string
  ): { cursorFechaHora: string; cursorId: string } | undefined {
    if (!cursor) return undefined
    const [cursorFechaHora, cursorId] = cursor.split('|')

    if (!cursorFechaHora || !cursorId) {
      throw new BadRequestException('El cursor debe tener formato fechaISO|id')
    }

    if (!dayjs(cursorFechaHora).isValid()) {
      throw new BadRequestException('La fecha del cursor no es válida')
    }

    return { cursorFechaHora, cursorId }
  }

  private construirRespuestaCursor(citas: Cita[], limite: number) {
    const hasMore = citas.length > limite
    const recortadas = hasMore ? citas.slice(0, limite) : citas
    const ultimo = recortadas.at(-1)
    const nextCursor =
      hasMore && ultimo
        ? `${dayjs(ultimo.fechaInicio).toISOString()}|${ultimo.id}`
        : undefined

    return { hasMore, recortadas, nextCursor }
  }

  private construirBloquePreview(
    citas: Cita[],
    limite: number,
    total: number
  ): HomePreviewBloqueResponseDto {
    return {
      items: formatearCitas(citas.slice(0, limite)),
      total,
      limitAplicado: limite,
      hasMore: total > limite,
    }
  }

  async obtenerHomeBandeja(
    filtros: HomeBandejaQueryDto,
    idUsuario: string,
    rol: string
  ): Promise<HomeBandejaResponseDto> {
    const { idPersonal, scopeAplicado } = this.resolverScope(
      filtros.scope,
      rol,
      idUsuario,
      filtros.idPersonal
    )

    const fechaBase = filtros.fechaBase
      ? dayjs(filtros.fechaBase).startOf('day')
      : dayjs().startOf('day')
    const limite = filtros.limitPreview ?? 10

    const [
      countPendientes,
      countRechazadas,
      countBorradores,
      countProgramadas,
      pendientes,
      rechazadas,
      borradores,
      programadasHoy,
      programadasResto,
    ] = await Promise.all([
      this.citasRepository.contarPendientesAprobacion({
        idPersonal,
        idLugar: filtros.idLugar,
        fechaBase: fechaBase.toISOString(),
      }),
      this.citasRepository.contarRechazadasSolicitadas({
        idSolicitante: idPersonal,
        idLugar: filtros.idLugar,
      }),
      this.citasRepository.contarBorradores({
        idSolicitante: idPersonal,
        idLugar: filtros.idLugar,
      }),
      this.citasRepository.contarProgramadasAsignadas({
        idPersonal,
        idLugar: filtros.idLugar,
        fechaBase: fechaBase.toISOString(),
      }),
      this.citasRepository.listarPendientesAprobacion({
        idPersonal,
        idLugar: filtros.idLugar,
        fechaBase: fechaBase.toISOString(),
        limite,
      }),
      this.citasRepository.listarRechazadasSolicitadas({
        idSolicitante: idPersonal,
        idLugar: filtros.idLugar,
        limite,
      }),
      this.citasRepository.listarBorradores({
        idSolicitante: idPersonal,
        idLugar: filtros.idLugar,
        limite,
      }),
      this.citasRepository.listarProgramadasAsignadasDelDia({
        idPersonal,
        idLugar: filtros.idLugar,
        dia: fechaBase.format('YYYY-MM-DD'),
      }),
      this.citasRepository.listarProgramadasAsignadas({
        idPersonal,
        idLugar: filtros.idLugar,
        fechaBase: fechaBase.toISOString(),
        limite,
      }),
    ])

    const programadasPreview =
      programadasHoy.length > limite
        ? programadasHoy
        : programadasResto.slice(0, limite)

    return {
      scopeAplicado,
      idPersonalAplicado: idPersonal,
      fechaBase: fechaBase.format('YYYY-MM-DD'),
      contadores: {
        pendientesAprobacionAsignadas: countPendientes,
        rechazadasSolicitadasPorMi: countRechazadas,
        borradores: countBorradores,
        programadasAsignadas: countProgramadas,
      },
      preview: {
        pendientesAprobacionAsignadas: this.construirBloquePreview(
          pendientes,
          limite,
          countPendientes
        ),
        rechazadasSolicitadasPorMi: this.construirBloquePreview(
          rechazadas,
          limite,
          countRechazadas
        ),
        borradores: this.construirBloquePreview(
          borradores,
          limite,
          countBorradores
        ),
        programadasAsignadas: {
          items: formatearCitas(programadasPreview),
          total: countProgramadas,
          limitAplicado: limite,
          reglaAplicada: 'top10_o_todas_las_de_hoy_si_hoy_gt_10',
          hasMore: countProgramadas > programadasPreview.length,
        },
      },
      updatedAt: dayjs().toISOString(),
    }
  }

  async listarHomePendientesAprobacion(
    filtros: HomeListadoQueryDto,
    idUsuario: string,
    rol: string
  ): Promise<[CitaResponseDto[], number]> {
    const { idPersonal } = this.resolverScope(
      filtros.scope,
      rol,
      idUsuario,
      filtros.idPersonal
    )

    const limite = filtros.limite
    const fechaBase = filtros.fechaBase
      ? dayjs(filtros.fechaBase).startOf('day').toISOString()
      : dayjs().startOf('day').toISOString()

    const [citas, total] =
      await this.citasRepository.listarPendientesAprobacionPaginado({
        idPersonal,
        idLugar: filtros.idLugar,
        fechaBase,
        limite,
        saltar: filtros.saltar,
      })

    return [formatearCitas(citas), total]
  }

  async listarHomeRechazadasSolicitadas(
    filtros: HomeListadoQueryDto,
    idUsuario: string,
    rol: string
  ): Promise<[CitaResponseDto[], number]> {
    const { idPersonal } = this.resolverScope(
      filtros.scope,
      rol,
      idUsuario,
      filtros.idPersonal
    )
    const limite = filtros.limite

    const [citas, total] =
      await this.citasRepository.listarRechazadasSolicitadasPaginado({
        idSolicitante: idPersonal,
        idLugar: filtros.idLugar,
        limite,
        saltar: filtros.saltar,
      })

    return [formatearCitas(citas), total]
  }

  async listarHomeBorradores(
    filtros: HomeListadoQueryDto,
    idUsuario: string,
    rol: string
  ): Promise<[CitaResponseDto[], number]> {
    const { idPersonal } = this.resolverScope(
      filtros.scope,
      rol,
      idUsuario,
      filtros.idPersonal
    )
    const limite = filtros.limite

    const [citas, total] = await this.citasRepository.listarBorradoresPaginado({
      idSolicitante: idPersonal,
      idLugar: filtros.idLugar,
      limite,
      saltar: filtros.saltar,
    })

    return [formatearCitas(citas), total]
  }

  async listarHomeProgramadasAsignadas(
    filtros: HomeProgramadasListadoQueryDto,
    idUsuario: string,
    rol: string
  ): Promise<[HomeGrupoDiaResponseDto[], number]> {
    const { idPersonal } = this.resolverScope(
      filtros.scope,
      rol,
      idUsuario,
      filtros.idPersonal
    )
    const limite = filtros.limite
    const fechaBase = this.obtenerDesdePorDefecto(filtros.fechaBase)
    const [citas, total] =
      await this.citasRepository.listarProgramadasAsignadasPaginado({
        idPersonal,
        idLugar: filtros.idLugar,
        fechaBase,
        dia: filtros.dia,
        limite,
        saltar: filtros.saltar,
      })

    const gruposMap = new Map<string, CitaResponseDto[]>()

    for (const cita of formatearCitas(citas)) {
      const dia = dayjs(cita.fechaInicio).format('YYYY-MM-DD')
      const actual = gruposMap.get(dia) ?? []
      actual.push(cita)
      gruposMap.set(dia, actual)
    }

    const grupos = Array.from(gruposMap).map(([dia, items]) => ({ dia, items }))

    return [grupos, total]
  }

  async obtenerMisResumen(
    filtros: MisResumenCitasDto,
    idUsuario: string,
    rol: string
  ): Promise<MisResumenResponseDto> {
    const { idPersonal } = this.resolverScope(
      filtros.scope,
      rol,
      idUsuario,
      filtros.idPersonal
    )

    const desde = this.obtenerDesdePorDefecto(filtros.desde)

    const resumen = await this.citasRepository.obtenerMisResumen({
      idPersonal,
      idLugar: filtros.idLugar,
      desde,
      hasta: filtros.hasta,
    })

    return {
      solicitadasPendientesConfirmacion: Number(
        resumen?.solicitadasPendientesConfirmacion ?? 0
      ),
      proximasProgramadas: Number(resumen?.proximasProgramadas ?? 0),
      totalDesdeHoy: Number(resumen?.totalDesdeHoy ?? 0),
      primeraFechaConCitas: resumen?.primeraFechaConCitas ?? null,
    }
  }

  async listarMisSolicitadas(
    filtros: MisSolicitadasQueryDto,
    idUsuario: string,
    rol: string
  ): Promise<MisSolicitadasResponseDto> {
    const { idPersonal } = this.resolverScope(
      filtros.scope,
      rol,
      idUsuario,
      filtros.idPersonal
    )
    const desde = this.obtenerDesdePorDefecto(filtros.desde)
    const cursor = this.parseCursor(filtros.cursor)

    const citas = await this.citasRepository.listarMisSolicitadas({
      idPersonal,
      idLugar: filtros.idLugar,
      desde,
      hasta: filtros.hasta,
      limite: filtros.limite ?? 20,
      cursorFechaHora: cursor?.cursorFechaHora,
      cursorId: cursor?.cursorId,
    })

    const { hasMore, recortadas, nextCursor } = this.construirRespuestaCursor(
      citas,
      filtros.limite ?? 20
    )

    const totalAprox = await this.citasRepository.contarMisSolicitadasAprox({
      idPersonal,
      idLugar: filtros.idLugar,
      desde,
      hasta: filtros.hasta,
    })

    return {
      items: formatearCitas(recortadas),
      nextCursor,
      hasMore,
      totalAprox,
    }
  }

  async listarMisTimeline(
    filtros: MisTimelineQueryDto,
    idUsuario: string,
    rol: string
  ): Promise<MisTimelineResponseDto> {
    const { idPersonal } = this.resolverScope(
      filtros.scope,
      rol,
      idUsuario,
      filtros.idPersonal
    )

    const limite = filtros.limite ?? 30
    const desde = this.obtenerDesdePorDefecto(filtros.desde)

    const citas = await this.citasRepository.listarMisTimeline({
      idPersonal,
      idLugar: filtros.idLugar,
      desde,
      hasta: filtros.hasta,
      limite,
      incluirSolicitadas: filtros.incluirSolicitadas === 'true',
      cursorFechaHora: filtros.cursorFechaHora,
      cursorId: filtros.cursorId,
    })

    const { hasMore, recortadas, nextCursor } = this.construirRespuestaCursor(
      citas,
      limite
    )

    const gruposMap = new Map<string, CitaResponseDto[]>()

    for (const cita of formatearCitas(recortadas)) {
      const fecha = dayjs(cita.fechaInicio).format('YYYY-MM-DD')
      const actual = gruposMap.get(fecha) ?? []
      actual.push(cita)
      gruposMap.set(fecha, actual)
    }

    const grupos: GrupoCitasPorFechaDto[] = Array.from(gruposMap).map(
      ([fecha, items]) => ({ fecha, items })
    )

    const nextCursorParts = nextCursor?.split('|')

    return {
      grupos,
      nextCursor: {
        cursorFechaHora: nextCursorParts?.[0],
        cursorId: nextCursorParts?.[1],
      },
      hasMore,
    }
  }

  // ===== Citas =====
  async listarCitas(
    filtros: FiltrosCitaDto,
    idUsuarioSolicitante?: string,
    rolSolicitante?: string
  ): Promise<CitaResponseDto[]> {
    const filtrosAplicados = this.aplicarRestriccionPorRolEnFiltros(
      filtros,
      idUsuarioSolicitante,
      rolSolicitante
    )
    const citas = await this.citasRepository.listarCitas(
      filtrosAplicados,
      idUsuarioSolicitante,
      rolSolicitante
    )
    return formatearCitas(citas)
  }

  async listarCitasPaginadas(
    filtros: FiltrosCitaPaginadoDto,
    idUsuarioSolicitante?: string,
    rolSolicitante?: string
  ): Promise<[CitaResponseDto[], number]> {
    const filtrosAplicados = this.aplicarRestriccionPorRolEnFiltros(
      filtros,
      idUsuarioSolicitante,
      rolSolicitante
    )
    const [citas, total] = await this.citasRepository.listarCitasPaginadas(
      filtrosAplicados,
      idUsuarioSolicitante,
      rolSolicitante
    )

    return [formatearCitas(citas), total]
  }

  async obtenerCantidadCitasPorDia(
    filtros: FiltrosCitaDto,
    idUsuarioSolicitante?: string,
    rolSolicitante?: string
  ): Promise<CantidadCitasPorDiaResponseDto[]> {
    const fechaInicio = dayjs(filtros.fechaInicio)
    const fechaFin = dayjs(filtros.fechaFin)

    if (fechaInicio.isAfter(fechaFin)) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor o igual a la fecha de fin'
      )
    }

    const fechaInicioRango = fechaInicio.startOf('day').format('YYYY-MM-DD')
    const fechaFinRango = fechaFin.endOf('day').format('YYYY-MM-DD')

    const filtrosAplicados = this.aplicarRestriccionPorRolEnFiltros(
      {
        ...filtros,
        fechaInicio: fechaInicioRango,
        fechaFin: fechaFinRango,
      },
      idUsuarioSolicitante,
      rolSolicitante
    )

    const datosAgrupados =
      await this.citasRepository.obtenerCantidadCitasPorDia(
        filtrosAplicados,
        idUsuarioSolicitante
      )

    const mapaCantidades = new Map(
      datosAgrupados.map((item) => [
        dayjs(item.fecha).format('YYYY-MM-DD'),
        Number(item.cantidad),
      ])
    )

    const respuesta: CantidadCitasPorDiaResponseDto[] = []
    let cursor = fechaInicio.startOf('day')
    const fechaFinDia = fechaFin.startOf('day')

    while (cursor.isSame(fechaFinDia) || cursor.isBefore(fechaFinDia)) {
      const fecha = cursor.format('YYYY-MM-DD')
      respuesta.push({
        fecha,
        cantidad: mapaCantidades.get(fecha) ?? 0,
      })
      cursor = cursor.add(1, 'day')
    }

    return respuesta
  }

  async listarMisCitas(
    filtros: FiltrosCitaDto,
    idPersonal: string,
    idUsuarioSolicitante?: string,
    rolSolicitante?: string
  ): Promise<CitaResponseDto[]> {
    return await this.listarCitas(
      { ...filtros, idPersonal },
      idUsuarioSolicitante,
      rolSolicitante
    )
  }

  @Cron(
    process.env.CITAS_AUTO_NO_ASISTIO_CRON ||
      process.env.CITAS_REVISION_DIARIA_CRON ||
      '0 1 * * *'
  )
  async actualizarCitasVencidas(): Promise<void> {
    const enabled =
      (process.env.CITAS_AUTO_NO_ASISTIO_ENABLED || 'true').toLowerCase() ===
      'true'

    if (!enabled) {
      return
    }

    await this.ejecutarAutoNoAsistio()
  }

  async ejecutarAutoNoAsistio(): Promise<number> {
    const fechaCorte = dayjs().startOf('day').toDate()
    const usuarioAuditoria = '0'
    const idEjecutor = '0'
    const actualizadas = await this.citasRepository.marcarCitasVencidas(
      fechaCorte,
      usuarioAuditoria,
      idEjecutor
    )

    if (actualizadas > 0) {
      this.logger.info(
        `Citas vencidas actualizadas automáticamente: ${actualizadas}`
      )
    }

    return actualizadas
  }

  async obtenerCita(
    id: string,
    transaccion?: EntityManager,
    idUsuarioSolicitante?: string,
    rolSolicitante?: string,
    incluirEstadosOcultos = false
  ): Promise<CitaResponseDto> {
    const cita = await this.citasRepository.obtenerCitaConRelaciones(
      id,
      transaccion,
      idUsuarioSolicitante,
      rolSolicitante,
      incluirEstadosOcultos
    )
    if (!cita) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return formatearCita(cita)
  }

  async obtenerCitaId(
    id: string,
    transaccion?: EntityManager,
    idUsuarioSolicitante?: string,
    rolSolicitante?: string,
    incluirEstadosOcultos = false
  ): Promise<Cita> {
    const cita = await this.citasRepository.obtenerCitaConRelaciones(
      id,
      transaccion,
      idUsuarioSolicitante,
      rolSolicitante,
      incluirEstadosOcultos
    )
    if (!cita) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return cita
  }

  async crearCita(
    dto: CrearCitaDto,
    usuarioAuditoria = '0',
    transaccion?: EntityManager,
    idEjecutor = '0',
    rolEjecutor?: string
  ): Promise<CitaResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearCita(
          dto,
          usuarioAuditoria,
          nuevaTransaccion,
          idEjecutor,
          rolEjecutor
        )
      }
      return await this.citasRepository.runTransaction(op)
    }

    const fechaInicio = dayjs(dto.fechaInicio).toDate()
    const tipoCita = dto.tipoCita
    if (!tipoCita) {
      throw new BadRequestException('El tipo de cita es obligatorio')
    }

    const idServicio = dto.idServicio
    if (!idServicio) {
      throw new BadRequestException('El servicio es obligatorio para la cita')
    }

    const servicio = await this.resolverServicio(
      idServicio,
      tipoCita,
      transaccion
    )
    const fechaFin = this.calcularFechaFin(
      fechaInicio,
      servicio.duracionMinutos
    )

    this.validarCamposObligatoriosParaOperar(dto)

    const estadoInicial =
      dto.accion === 'GUARDAR'
        ? CitasEstado.BORRADOR
        : await this.resolverEstadoConAsignacion(dto.idPersonal)

    const citaId = await this.citasRepository.crearCita(
      {
        detalle: dto.detalle,
        fechaInicio,
        fechaFin,
        estado: estadoInicial,
        idPersonal: dto.idPersonal,
        idPaciente: dto.idPaciente ?? null,
        idConsultorio: dto.idConsultorio ?? null,
        idLugar: dto.idLugar ?? null,
        idServicio: servicio.id,
        tipoCita,
        idHistorialCita: randomUUID(),
        idUsuarioProgramo: idEjecutor,
        idUsuarioEnvio: dto.accion === 'ENVIAR' ? idEjecutor : null,
      },
      usuarioAuditoria,
      idEjecutor,
      transaccion
    )
    if (!citaId) {
      throw new BadRequestException('No fue posible registrar la cita')
    }

    const citaCreada = await this.obtenerCitaId(citaId, transaccion)
    await this.notificarCitaSolicitada(
      citaCreada,
      usuarioAuditoria,
      idEjecutor,
      transaccion
    )
    await this.notificarCitaProgramada(
      citaCreada,
      usuarioAuditoria,
      idEjecutor,
      transaccion
    )

    return formatearCita(citaCreada)
  }

  async actualizarCita(
    id: string,
    dto: ActualizarCitaDto,
    usuarioAuditoria = '0',
    transaccion?: EntityManager,
    idEjecutor = '0',
    rolEjecutor?: string
  ): Promise<CitaResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarCita(
          id,
          dto,
          usuarioAuditoria,
          nuevaTransaccion,
          idEjecutor,
          rolEjecutor
        )
      }
      return await this.citasRepository.runTransaction(op)
    }

    const cita = await this.obtenerCitaId(id, transaccion)
    const estadoActual = cita.estado as CitasEstado
    if (estadoActual === CitasEstado.BORRADOR) {
      this.validarPermisoEdicionBorrador(cita, idEjecutor)
    } else if (estadoActual === CitasEstado.PROGRAMADA) {
      this.validarPermisoEdicionProgramada(rolEjecutor, idEjecutor)
      if (dto.idPaciente !== undefined) {
        throw new BadRequestException(
          'En estado PROGRAMADA no se permite modificar paciente'
        )
      }

      const requiereReprogramacion =
        dto.idServicio !== undefined ||
        dto.tipoCita !== undefined ||
        (dto.fechaInicio !== undefined &&
          !dayjs(dto.fechaInicio).isSame(dayjs(cita.fechaInicio), 'day'))

      if (requiereReprogramacion) {
        const idPersonalReprogramacion = dto.idPersonal ?? cita.idPersonal
        const idLugarReprogramacion = dto.idLugar ?? cita.idLugar
        const idServicioReprogramacion = dto.idServicio ?? cita.idServicio
        const tipoCitaReprogramacion = dto.tipoCita ?? cita.tipoCita
        const fechaInicioReprogramacion = dto.fechaInicio
          ? dayjs(dto.fechaInicio).toISOString()
          : dayjs(cita.fechaInicio).toISOString()

        if (!idPersonalReprogramacion || !idLugarReprogramacion) {
          throw new BadRequestException(
            'Para reprogramar desde PROGRAMADA se requiere personal y lugar'
          )
        }

        if (!idServicioReprogramacion || !tipoCitaReprogramacion) {
          throw new BadRequestException(
            'Para reprogramar desde PROGRAMADA se requiere servicio y tipo de cita'
          )
        }

        return await this.ejecutarReprogramacion(
          id,
          {
            detalle: dto.detalle ?? cita.detalle ?? undefined,
            fechaInicio: fechaInicioReprogramacion,
            idPersonal: idPersonalReprogramacion,
            idConsultorio:
              dto.idConsultorio !== undefined
                ? dto.idConsultorio
                : (cita.idConsultorio ?? undefined),
            idLugar: idLugarReprogramacion,
            tipoCita: tipoCitaReprogramacion,
            idServicio: idServicioReprogramacion,
          },
          usuarioAuditoria,
          idEjecutor,
          [CitasEstado.PROGRAMADA]
        )
      }
    } else {
      throw new BadRequestException(
        `La cita en estado ${cita.estado} no permite edición`
      )
    }

    const updateData: Partial<Cita> = {}

    if (dto.detalle !== undefined) {
      updateData.detalle = dto.detalle
    }

    if (dto.idPersonal !== undefined) {
      updateData.idPersonal = dto.idPersonal
      if (estadoActual === CitasEstado.PROGRAMADA) {
        updateData.estado = await this.resolverEstadoConAsignacion(
          dto.idPersonal
        )
      }
    }

    if (dto.idPaciente !== undefined) {
      updateData.idPaciente = dto.idPaciente
    }

    if (dto.idConsultorio !== undefined) {
      updateData.idConsultorio = dto.idConsultorio
    }

    if (dto.idLugar !== undefined) {
      updateData.idLugar = dto.idLugar
    }

    const requiereRecalculo =
      dto.fechaInicio !== undefined ||
      dto.idServicio !== undefined ||
      dto.tipoCita !== undefined

    if (requiereRecalculo) {
      const fechaInicio = dto.fechaInicio
        ? dayjs(dto.fechaInicio).toDate()
        : cita.fechaInicio

      const tipoCita = dto.tipoCita ?? cita.tipoCita ?? TipoCita.CONSULTA
      const idServicio = dto.idServicio ?? cita.idServicio

      if (!idServicio) {
        throw new BadRequestException('El servicio es obligatorio para la cita')
      }

      const servicio = await this.resolverServicio(
        idServicio,
        tipoCita,
        transaccion
      )

      const fechaFin = this.calcularFechaFin(
        fechaInicio ?? dayjs(cita.fechaInicio).toDate(),
        servicio.duracionMinutos
      )

      updateData.fechaInicio = fechaInicio
      updateData.fechaFin = fechaFin
      updateData.idServicio = servicio.id
      updateData.tipoCita = tipoCita
    }

    const actualizado = await this.citasRepository.actualizarCita(
      cita,
      updateData,
      usuarioAuditoria,
      idEjecutor,
      transaccion
    )

    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }

    const citaActualizada = await this.obtenerCitaId(id, transaccion)

    if (estadoActual === CitasEstado.PROGRAMADA) {
      await this.notificarCitaActualizada(
        cita,
        citaActualizada,
        usuarioAuditoria,
        idEjecutor,
        transaccion
      )
    }

    return formatearCita(citaActualizada)
  }

  async editarBorradorCita(
    id: string,
    dto: EditarBorradorCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0',
    rolEjecutor?: string
  ): Promise<CitaResponseDto> {
    const cita = await this.obtenerCitaId(id)
    this.validarEstado(cita, [CitasEstado.BORRADOR])
    this.validarPermisoEdicionBorrador(cita, idEjecutor)
    return await this.actualizarCita(
      id,
      dto,
      usuarioAuditoria,
      undefined,
      idEjecutor,
      rolEjecutor
    )
  }

  async editarProgramadaCita(
    id: string,
    dto: EditarProgramadaCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0',
    rolEjecutor?: string
  ): Promise<CitaResponseDto> {
    const cita = await this.obtenerCitaId(id)
    this.validarEstado(cita, [CitasEstado.PROGRAMADA])
    this.validarPermisoEdicionProgramada(rolEjecutor, idEjecutor)
    return await this.actualizarCita(
      id,
      dto,
      usuarioAuditoria,
      undefined,
      idEjecutor,
      rolEjecutor
    )
  }

  async enviarCita(
    id: string,
    dto: EnviarCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    return await this.citasRepository.runTransaction(async (transaccion) => {
      const cita = await this.obtenerCitaId(id, transaccion)
      this.validarEstado(cita, [CitasEstado.BORRADOR, CitasEstado.RECHAZADA])

      const estadoAnterior = cita.estado as CitasEstado
      cita.idPersonal = dto.idPersonal ?? cita.idPersonal
      this.validarCamposObligatoriosParaOperar(cita)
      cita.estado = await this.resolverEstadoConAsignacion(cita.idPersonal)
      cita.idUsuarioEnvio = idEjecutor
      cita.usuarioModificacion = usuarioAuditoria
      await this.citasRepository.guardarCita(cita, transaccion)

      await this.citasRepository.crearHistorialAccion(
        {
          idCita: cita.id,
          idEjecutor,
          comentario: 'Envío de cita',
          detalleCambios: this.crearDetalleCambiosEstado(
            estadoAnterior,
            cita.estado
          ),
          usuarioCreacion: usuarioAuditoria,
        },
        transaccion
      )

      await this.notificarCitaSolicitada(
        cita,
        usuarioAuditoria,
        idEjecutor,
        transaccion
      )
      await this.notificarCitaProgramada(
        cita,
        usuarioAuditoria,
        idEjecutor,
        transaccion
      )

      return formatearCita(cita)
    })
  }

  async confirmarCita(
    id: string,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    return await this.citasRepository.runTransaction(async (transaccion) => {
      const cita = await this.obtenerCitaId(id, transaccion)
      this.validarEstado(cita, [CitasEstado.SOLICITADA])

      const estadoAnterior = cita.estado as CitasEstado
      cita.estado = CitasEstado.PROGRAMADA
      cita.usuarioModificacion = usuarioAuditoria
      await this.citasRepository.guardarCita(cita, transaccion)
      await this.citasRepository.crearHistorialAccion(
        {
          idCita: cita.id,
          idEjecutor,
          comentario: 'Confirmación de cita solicitada',
          detalleCambios: this.crearDetalleCambiosEstado(
            estadoAnterior,
            cita.estado
          ),
          usuarioCreacion: usuarioAuditoria,
        },
        transaccion
      )
      await this.notificarCitaProgramada(
        cita,
        usuarioAuditoria,
        idEjecutor,
        transaccion
      )
      return await this.obtenerCita(cita.id, transaccion)
    })
  }

  async rechazarCita(
    id: string,
    dto: RechazarCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    return await this.actualizarEstadoCita(
      id,
      { estado: CitasEstado.RECHAZADA },
      usuarioAuditoria,
      idEjecutor,
      [CitasEstado.SOLICITADA],
      dto.motivoRechazo ?? undefined
    )
  }

  async darAltaCita(
    id: string,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    return await this.actualizarEstadoCita(
      id,
      { estado: CitasEstado.COMPLETADA },
      usuarioAuditoria,
      idEjecutor,
      [CitasEstado.PROGRAMADA],
      'Cita dada de alta'
    )
  }

  async programarControlCita(
    id: string,
    dto: ProgramarControlCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    return await this.citasRepository.runTransaction(async (transaccion) => {
      const citaOriginal = await this.obtenerCitaId(id, transaccion)
      this.validarEstado(citaOriginal, [CitasEstado.PROGRAMADA])

      const fechaInicio = dayjs(dto.fechaInicio).toDate()
      const tipoCita = dto.tipoCita
      const idServicio = dto.idServicio

      if (!idServicio) {
        throw new BadRequestException('El servicio es obligatorio para la cita')
      }

      const servicio = await this.resolverServicio(
        idServicio,
        tipoCita,
        transaccion
      )
      const fechaFin = this.calcularFechaFin(
        fechaInicio,
        servicio.duracionMinutos
      )

      const historialCitaAnterior = citaOriginal.idHistorialCita ?? undefined
      const citaNuevaAnterior = citaOriginal.idCitaNueva ?? undefined
      const historialCitaId = citaOriginal.idHistorialCita ?? randomUUID()
      const estadoAnterior = citaOriginal.estado as CitasEstado
      citaOriginal.idHistorialCita = historialCitaId
      citaOriginal.estado = CitasEstado.COMPLETADA
      citaOriginal.usuarioModificacion = usuarioAuditoria

      const nuevaCitaId = await this.citasRepository.crearCita(
        {
          detalle: dto.detalle ?? citaOriginal.detalle,
          fechaInicio,
          fechaFin,
          estado: CitasEstado.PROGRAMADA,
          idPersonal: dto.idPersonal ?? citaOriginal.idPersonal,
          idPaciente: citaOriginal.idPaciente ?? null,
          idConsultorio:
            dto.idConsultorio !== undefined
              ? dto.idConsultorio
              : (citaOriginal.idConsultorio ?? null),
          idLugar: dto.idLugar ?? citaOriginal.idLugar ?? null,
          idServicio: servicio.id,
          tipoCita,
          idHistorialCita: historialCitaId,
          idUsuarioProgramo: citaOriginal.idUsuarioProgramo ?? idEjecutor,
          idUsuarioEnvio: idEjecutor,
        },
        usuarioAuditoria,
        idEjecutor,
        transaccion,
        {
          crearHistorialInicial: false,
        }
      )

      citaOriginal.idCitaNueva = nuevaCitaId
      await this.citasRepository.guardarCita(citaOriginal, transaccion)

      const comentario = `Se programó control para ${dayjs(fechaInicio).format(
        'DD/MM/YYYY HH:mm'
      )}. Nueva cita ${nuevaCitaId}.`

      await this.citasRepository.crearHistorialAccion(
        {
          idCita: citaOriginal.id,
          idEjecutor,
          comentario,
          detalleCambios: [
            ...this.crearDetalleCambiosEstado(
              estadoAnterior,
              CitasEstado.COMPLETADA
            ),
            {
              field: 'accion',
              before: undefined,
              after: 'PROGRAMAR_CONTROL',
            },
            {
              field: 'idCitaNueva',
              before: citaNuevaAnterior,
              after: nuevaCitaId,
            },
            {
              field: 'idHistorialCita',
              before: historialCitaAnterior,
              after: historialCitaId,
            },
          ],
          usuarioCreacion: usuarioAuditoria,
        },
        transaccion
      )

      const nuevaCita = await this.obtenerCitaId(nuevaCitaId, transaccion)
      await this.notificarControlProgramado(
        nuevaCita,
        usuarioAuditoria,
        idEjecutor,
        transaccion
      )

      return formatearCita(nuevaCita)
    })
  }

  async marcarNoAsistioCita(
    id: string,
    dto: MarcarNoAsistioCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    return await this.actualizarEstadoCita(
      id,
      { estado: CitasEstado.NO_ASISTIO },
      usuarioAuditoria,
      idEjecutor,
      [CitasEstado.PROGRAMADA],
      dto.comentario ?? 'Marcado manual de no asistencia'
    )
  }

  async eliminarBorrador(
    id: string,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    return await this.actualizarEstadoCita(
      id,
      { estado: CitasEstado.INACTIVO },
      usuarioAuditoria,
      idEjecutor,
      [CitasEstado.BORRADOR, CitasEstado.RECHAZADA],
      'Eliminación lógica de borrador'
    )
  }

  async actualizarEstadoCita(
    id: string,
    dto: ActualizarEstadoCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0',
    estadosPermitidos?: CitasEstado[],
    comentario?: string
  ): Promise<CitaResponseDto> {
    if (!estadosPermitidos?.length) {
      const actualizado = await this.citasRepository.actualizarEstadoCita(
        id,
        dto,
        usuarioAuditoria,
        idEjecutor
      )
      if (!actualizado) {
        throw new NotFoundException('La cita solicitada no existe')
      }
      const citaActualizada = await this.obtenerCita(id)
      await this.notificarCitaProgramada(
        await this.obtenerCitaId(id),
        usuarioAuditoria,
        idEjecutor
      )
      return citaActualizada
    }

    return await this.citasRepository.runTransaction(async (transaccion) => {
      const cita = await this.obtenerCitaId(id, transaccion)
      this.validarEstado(cita, estadosPermitidos)
      const estadoAnterior = cita.estado as CitasEstado
      cita.estado = dto.estado
      cita.usuarioModificacion = usuarioAuditoria
      await this.citasRepository.guardarCita(cita, transaccion)
      await this.citasRepository.crearHistorialAccion(
        {
          idCita: cita.id,
          idEjecutor,
          comentario: comentario ?? 'Actualización de estado de cita',
          detalleCambios: this.crearDetalleCambiosEstado(
            estadoAnterior,
            cita.estado
          ),
          usuarioCreacion: usuarioAuditoria,
        },
        transaccion
      )

      await this.notificarCitaSolicitada(
        cita,
        usuarioAuditoria,
        idEjecutor,
        transaccion
      )
      await this.notificarCitaProgramada(
        cita,
        usuarioAuditoria,
        idEjecutor,
        transaccion
      )

      return formatearCita(cita)
    })
  }

  async reprogramarCita(
    id: string,
    dto: ReprogramarCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    return await this.ejecutarReprogramacion(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor,
      [CitasEstado.CANCELADA, CitasEstado.NO_ASISTIO]
    )
  }

  private async ejecutarReprogramacion(
    id: string,
    dto: ReprogramarCitaDto,
    usuarioAuditoria: string,
    idEjecutor: string,
    estadosPermitidos: CitasEstado[]
  ): Promise<CitaResponseDto> {
    return await this.citasRepository.runTransaction(async (transaccion) => {
      const citaOriginal = await this.obtenerCitaId(id, transaccion)
      this.validarEstado(citaOriginal, estadosPermitidos)

      const fechaInicio = dayjs(dto.fechaInicio).toDate()
      const tipoCita = dto.tipoCita
      const idServicio = dto.idServicio ?? citaOriginal.idServicio
      const estadoAnterior = citaOriginal.estado as CitasEstado
      const fechaInicioAnterior = citaOriginal.fechaInicio
      const fechaFinAnterior = citaOriginal.fechaFin
      if (!idServicio) {
        throw new BadRequestException('El servicio es obligatorio para la cita')
      }

      const servicio = await this.resolverServicio(
        idServicio,
        tipoCita,
        transaccion
      )
      const fechaFin = this.calcularFechaFin(
        fechaInicio,
        servicio.duracionMinutos
      )

      const historialCitaId = citaOriginal.idHistorialCita ?? randomUUID()
      citaOriginal.idHistorialCita = historialCitaId
      citaOriginal.estado = CitasEstado.REPROGRAMADA
      citaOriginal.usuarioModificacion = usuarioAuditoria

      const nuevaCitaId = await this.citasRepository.crearCita(
        {
          detalle: dto.detalle ?? citaOriginal.detalle,
          fechaInicio,
          fechaFin,
          estado: await this.resolverEstadoConAsignacion(dto.idPersonal),
          idPersonal: dto.idPersonal,
          idPaciente: citaOriginal.idPaciente ?? null,
          idConsultorio: dto.idConsultorio ?? null,
          idLugar: dto.idLugar ?? null,
          idServicio: servicio.id,
          tipoCita,
          idHistorialCita: historialCitaId,
          idUsuarioProgramo: citaOriginal.idUsuarioProgramo,
          idUsuarioEnvio: idEjecutor,
        },
        usuarioAuditoria,
        idEjecutor,
        transaccion,
        {
          crearHistorialInicial: false,
        }
      )

      citaOriginal.idCitaNueva = nuevaCitaId
      await this.citasRepository.guardarCita(citaOriginal, transaccion)
      const rangoAnterior = `${
        fechaInicioAnterior
          ? dayjs(fechaInicioAnterior).format('DD/MM/YYYY HH:mm')
          : 'sin fecha'
      } - ${
        fechaFinAnterior
          ? dayjs(fechaFinAnterior).format('DD/MM/YYYY HH:mm')
          : 'sin fecha'
      }`
      const rangoNuevo = `${dayjs(fechaInicio).format(
        'DD/MM/YYYY HH:mm'
      )} - ${dayjs(fechaFin).format('DD/MM/YYYY HH:mm')}`
      const comentarioReprogramacion = `Cita reprogramada: antes ${rangoAnterior}, ahora ${rangoNuevo}`

      await this.citasRepository.crearHistorialAccion(
        {
          idCita: citaOriginal.id,
          idEjecutor,
          comentario: comentarioReprogramacion,
          detalleCambios: [
            ...this.crearDetalleCambiosEstado(
              estadoAnterior,
              CitasEstado.REPROGRAMADA
            ),
            {
              field: 'fechaInicio',
              before: fechaInicioAnterior?.toISOString(),
              after: fechaInicio.toISOString(),
            },
            {
              field: 'fechaFin',
              before: fechaFinAnterior?.toISOString(),
              after: fechaFin.toISOString(),
            },
          ],
          usuarioCreacion: usuarioAuditoria,
        },
        transaccion
      )

      const nuevaCita = await this.obtenerCitaId(nuevaCitaId, transaccion)
      await this.notificarCitaSolicitada(
        nuevaCita,
        usuarioAuditoria,
        idEjecutor,
        transaccion
      )

      return formatearCita(nuevaCita)
    })
  }

  async cancelarCita(
    id: string,
    dto: CancelarCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    const cita = await this.obtenerCitaId(id)
    this.validarEstado(cita, [CitasEstado.PROGRAMADA])
    const actualizado = await this.citasRepository.cancelarCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }

    cita.estado = CitasEstado.CANCELADA
    return formatearCita(cita)
  }
}
