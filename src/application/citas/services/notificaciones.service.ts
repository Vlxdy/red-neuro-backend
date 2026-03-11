import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import dayjs from 'dayjs'
import { NotificacionesRepository } from '../repository/notificaciones.repository'
import { DispositivosPushRepository } from '../repository/dispositivos-push.repository'
import {
  FiltroNotificacionDto,
  NotificacionResponseDto,
  ResumenDiarioResponseDto,
} from '../dto/notificacion.dto'
import { RolEnumId } from '@/core/authorization/rol.enum'
import { Notificacion } from '../entities/notificacion.entity'
import { FirebasePushService } from '@/core/external-services/firebase/firebase-push.service'
import { CitasGateway } from '../gateways/citas.gateway'

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly notificacionesRepository: NotificacionesRepository,
    private readonly dispositivosPushRepository: DispositivosPushRepository,
    private readonly firebasePushService: FirebasePushService,
    private readonly citasGateway: CitasGateway
  ) {}

  @Cron('*/10 * * * *')
  async generarResumenDiarioProgramado() {
    const enabled =
      (process.env.NOTIF_DAILY_SUMMARY_ENABLED || 'true').toLowerCase() ===
      'true'

    if (!enabled) return

    const hora = process.env.NOTIF_DAILY_SUMMARY_HOUR || '06:45'
    if (hora !== dayjs().format('HH:mm')) return

    await this.generarResumenDiarioParaTodos()
  }

  async listar(
    filtros: FiltroNotificacionDto,
    idUsuarioRol: string,
    idRol: string
  ): Promise<[NotificacionResponseDto[], number]> {
    const [filas, total] = await this.notificacionesRepository.listar(
      filtros,
      idUsuarioRol,
      idRol
    )

    return [filas.map((n) => this.mapearNotificacion(n)), total]
  }

  private mapearNotificacion(n: Notificacion): NotificacionResponseDto {
    return {
      id: n.id,
      tipo: n.tipo,
      mensaje: n.mensaje,
      visto: Boolean(n.visto),
      idCita: n.idCita,
      idPersonal: n.idPersonal,
      fechaCreacion: n.fechaCreacion,
    }
  }

  async marcarVisto(
    id: string,
    usuarioAuditoria: string,
    idRol: string,
    idUsuarioRol: string
  ) {
    const notificacion = await this.notificacionesRepository.obtenerPorId(
      id,
      idRol,
      idUsuarioRol
    )
    if (!notificacion) return false

    notificacion.visto = true
    notificacion.usuarioModificacion = usuarioAuditoria
    await this.notificacionesRepository.guardarNotificacion(notificacion)
    this.citasGateway.emitNotificacionVista(idUsuarioRol, id)
    return true
  }

  async marcarTodasVistas(
    usuarioAuditoria: string,
    idRol: string,
    idUsuarioRol: string
  ): Promise<number> {
    const pendientes = await this.notificacionesRepository.obtenerPendientes(
      idRol,
      idUsuarioRol
    )
    if (!pendientes.length) return 0

    pendientes.forEach((n) => {
      n.visto = true
      n.usuarioModificacion = usuarioAuditoria
    })

    await this.notificacionesRepository.guardarNotificaciones(pendientes)
    this.citasGateway.emitNotificacionesTodasVistas(
      idUsuarioRol,
      pendientes.length
    )
    return pendientes.length
  }

  async obtenerResumenDiario(
    idUsuarioRol: string,
    idRol: string,
    fecha = dayjs().format('YYYY-MM-DD')
  ): Promise<ResumenDiarioResponseDto> {
    if (idRol === RolEnumId.PERSONAL_SALUD) {
      const citasConfirmadasAsignadas =
        await this.notificacionesRepository.contarConfirmadasAsignadas(
          idUsuarioRol,
          fecha
        )

      return {
        fecha,
        citasConfirmadasAsignadas,
      }
    }

    const { citasConPersonal, citasSinPersonal } =
      await this.notificacionesRepository.contarConfirmadasAdmin(fecha)

    return {
      fecha,
      citasConPersonal,
      citasSinPersonal,
    }
  }

  private async enviarPushResumenDiario(
    destinatarios: Array<{ idUsuarioRol: string; title: string; body: string }>
  ): Promise<void> {
    if (!destinatarios.length) return

    const tokens =
      await this.dispositivosPushRepository.listarTokensActivosPorUsuarios(
        destinatarios.map((d) => d.idUsuarioRol)
      )

    if (!tokens.length) return

    const body = 'Tienes un nuevo resumen diario de citas disponible.'
    await this.firebasePushService.sendToMany({
      tokens,
      title: 'Resumen diario de citas',
      body,
      data: {
        tipo: 'RESUMEN_DIARIO',
      },
    })
  }

  async generarResumenDiarioParaTodos(): Promise<number> {
    const fecha = dayjs().format('YYYY-MM-DD')
    const personals =
      await this.notificacionesRepository.obtenerConteoPorPersonal(fecha)

    const mensajesPersonal = personals.map((p) =>
      this.notificacionesRepository.crearNotificacionResumenPersonal(
        p.idPersonal,
        Number(p.cantidad)
      )
    )

    const { citasConPersonal, citasSinPersonal } =
      await this.notificacionesRepository.contarConfirmadasAdmin(fecha)

    const admins =
      await this.notificacionesRepository.obtenerAdministradoresActivos()

    const mensajesAdmin = admins.map((a) =>
      this.notificacionesRepository.crearNotificacionResumenAdmin(
        a.id,
        citasConPersonal,
        citasSinPersonal
      )
    )

    const aGuardar = [...mensajesPersonal, ...mensajesAdmin]
    if (!aGuardar.length) return 0

    const guardadas =
      await this.notificacionesRepository.guardarNotificaciones(aGuardar)

    guardadas.forEach((notificacion) => {
      if (!notificacion.idPersonal) return
      this.citasGateway.emitNuevaNotificacion(
        notificacion.idPersonal,
        this.mapearNotificacion(notificacion)
      )
    })

    await this.enviarPushResumenDiario([
      ...personals.map((p) => ({
        idUsuarioRol: p.idPersonal,
        title: 'Resumen diario de citas',
        body: `Tienes ${Number(p.cantidad)} citas confirmadas para hoy.`,
      })),
      ...admins.map((a) => ({
        idUsuarioRol: a.id,
        title: 'Resumen diario de citas',
        body: `Con personal ${citasConPersonal}, sin personal ${citasSinPersonal}.`,
      })),
    ])

    return aGuardar.length
  }
}
