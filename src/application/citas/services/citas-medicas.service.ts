import { BaseService } from '@/common/base'
import {
  BadRequestException,
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
  ConfirmarCitaDto,
  CantidadCitasPorDiaResponseDto,
  CitaResponseDto,
  CrearCitaDto,
  EditarBorradorCitaDto,
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
  RechazarCitaDto,
  ReprogramarCitaDto,
} from '../dto/cita.dto'

import { CitasMedicasRepository } from '../repository/citas-medicas.repository'
import { formatearCita, formatearCitas } from '../utils/formatear-citas'
import { EntityManager } from 'typeorm'
import { Cita } from '../entities/cita.entity'
import { CitasEstado, TipoCita } from '../constants'
import { RolEnumId } from '@/core/authorization/rol.enum'
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

  private async obtenerNombreAccionador(idEjecutor: string): Promise<string> {
    return (
      (await this.notificacionesRepository.obtenerNombreCompletoUsuarioRol(
        idEjecutor
      )) || 'Personal de salud'
    )
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

  private resolverScope(
    scope: string | undefined,
    idRol: string,
    idUsuarioRol: string,
    idPersonal?: string
  ) {
    const esAdmin = String(idRol) === RolEnumId.ADMINISTRADOR
    const usarScopeAll = scope === 'all' && esAdmin

    if (!usarScopeAll) {
      return { idPersonal: idUsuarioRol }
    }

    return { idPersonal }
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

  async obtenerMisResumen(
    filtros: MisResumenCitasDto,
    idUsuarioRol: string,
    idRol: string
  ): Promise<MisResumenResponseDto> {
    const { idPersonal } = this.resolverScope(
      filtros.scope,
      idRol,
      idUsuarioRol,
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
      proximasConfirmadas: Number(resumen?.proximasConfirmadas ?? 0),
      totalDesdeHoy: Number(resumen?.totalDesdeHoy ?? 0),
      primeraFechaConCitas: resumen?.primeraFechaConCitas ?? null,
    }
  }

  async listarMisSolicitadas(
    filtros: MisSolicitadasQueryDto,
    idUsuarioRol: string,
    idRol: string
  ): Promise<MisSolicitadasResponseDto> {
    const { idPersonal } = this.resolverScope(
      filtros.scope,
      idRol,
      idUsuarioRol,
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
    idUsuarioRol: string,
    idRol: string
  ): Promise<MisTimelineResponseDto> {
    const { idPersonal } = this.resolverScope(
      filtros.scope,
      idRol,
      idUsuarioRol,
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
    idUsuarioSolicitante?: string
  ): Promise<CitaResponseDto[]> {
    const citas = await this.citasRepository.listarCitas(
      filtros,
      idUsuarioSolicitante
    )
    return formatearCitas(citas)
  }

  async listarCitasPaginadas(
    filtros: FiltrosCitaPaginadoDto,
    idUsuarioSolicitante?: string
  ): Promise<[CitaResponseDto[], number]> {
    const [citas, total] = await this.citasRepository.listarCitasPaginadas(
      filtros,
      idUsuarioSolicitante
    )

    return [formatearCitas(citas), total]
  }

  async obtenerCantidadCitasPorDia(
    filtros: FiltrosCitaDto,
    idUsuarioSolicitante?: string
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

    const datosAgrupados =
      await this.citasRepository.obtenerCantidadCitasPorDia(
        {
          ...filtros,
          fechaInicio: fechaInicioRango,
          fechaFin: fechaFinRango,
        },
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
    idUsuarioSolicitante?: string
  ): Promise<CitaResponseDto[]> {
    return await this.listarCitas(
      { ...filtros, idPersonal },
      idUsuarioSolicitante
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
    idUsuarioSolicitante?: string
  ): Promise<CitaResponseDto> {
    const cita = await this.citasRepository.obtenerCitaConRelaciones(
      id,
      transaccion,
      idUsuarioSolicitante
    )
    if (!cita) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return formatearCita(cita)
  }

  async obtenerCitaId(
    id: string,
    transaccion?: EntityManager,
    idUsuarioSolicitante?: string
  ): Promise<Cita> {
    const cita = await this.citasRepository.obtenerCitaConRelaciones(
      id,
      transaccion,
      idUsuarioSolicitante
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
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearCita(
          dto,
          usuarioAuditoria,
          nuevaTransaccion,
          idEjecutor
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

    const estadoInicial =
      dto.accion === 'GUARDAR'
        ? CitasEstado.BORRADOR
        : dto.idPersonal
          ? CitasEstado.SOLICITADA
          : CitasEstado.CONFIRMADA

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

    return formatearCita(citaCreada)
  }

  async actualizarCita(
    id: string,
    dto: ActualizarCitaDto,
    usuarioAuditoria = '0',
    transaccion?: EntityManager,
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarCita(
          id,
          dto,
          usuarioAuditoria,
          nuevaTransaccion,
          idEjecutor
        )
      }
      return await this.citasRepository.runTransaction(op)
    }

    const cita = await this.obtenerCitaId(id, transaccion)

    const updateData: Partial<Cita> = {}

    if (dto.detalle !== undefined) {
      updateData.detalle = dto.detalle
    }

    if (dto.idPersonal !== undefined) {
      updateData.idPersonal = dto.idPersonal
      updateData.estado = CitasEstado.SOLICITADA
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

    return await this.obtenerCita(id, transaccion)
  }

  async editarBorradorCita(
    id: string,
    dto: EditarBorradorCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    const cita = await this.obtenerCitaId(id)
    this.validarEstado(cita, [CitasEstado.BORRADOR])
    return await this.actualizarCita(
      id,
      dto,
      usuarioAuditoria,
      undefined,
      idEjecutor
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
      cita.estado = cita.idPersonal
        ? CitasEstado.SOLICITADA
        : CitasEstado.CONFIRMADA
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

      return await this.obtenerCita(cita.id, transaccion)
    })
  }

  async confirmarCita(
    id: string,
    dto: ConfirmarCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    return await this.citasRepository.runTransaction(async (transaccion) => {
      const cita = await this.obtenerCitaId(id, transaccion)
      this.validarEstado(cita, [CitasEstado.SOLICITADA])

      if (dto.fechaInicio) {
        const fechaInicio = dayjs(dto.fechaInicio).toDate()
        const servicio = await this.resolverServicio(
          cita.idServicio as string,
          cita.tipoCita,
          transaccion
        )
        cita.fechaInicio = fechaInicio
        cita.fechaFin = this.calcularFechaFin(
          fechaInicio,
          servicio.duracionMinutos
        )
      }

      if (dto.detalle !== undefined) {
        cita.detalle = dto.detalle
      }

      const estadoAnterior = cita.estado as CitasEstado
      cita.estado = CitasEstado.CONFIRMADA
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

  async completarCita(
    id: string,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    return await this.actualizarEstadoCita(
      id,
      { estado: CitasEstado.COMPLETADA },
      usuarioAuditoria,
      idEjecutor,
      [CitasEstado.CONFIRMADA]
    )
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
      [CitasEstado.CONFIRMADA],
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
      [CitasEstado.BORRADOR],
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
      return await this.obtenerCita(id)
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

      return await this.obtenerCita(cita.id, transaccion)
    })
  }

  async reprogramarCita(
    id: string,
    dto: ReprogramarCitaDto,
    usuarioAuditoria = '0',
    idEjecutor = '0'
  ): Promise<CitaResponseDto> {
    return await this.citasRepository.runTransaction(async (transaccion) => {
      const citaOriginal = await this.obtenerCitaId(id, transaccion)
      this.validarEstado(citaOriginal, [
        CitasEstado.CONFIRMADA,
        CitasEstado.CANCELADA,
        CitasEstado.NO_ASISTIO,
      ])

      const fechaInicio = dayjs(dto.fechaInicio).toDate()
      const tipoCita = dto.tipoCita
      const idServicio = dto.idServicio ?? citaOriginal.idServicio
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

      citaOriginal.estado = CitasEstado.REPROGRAMADA
      citaOriginal.usuarioModificacion = usuarioAuditoria

      const nuevaCitaId = await this.citasRepository.crearCita(
        {
          detalle: citaOriginal.detalle,
          fechaInicio,
          fechaFin,
          estado: citaOriginal.idPersonal
            ? CitasEstado.SOLICITADA
            : CitasEstado.CONFIRMADA,
          idPersonal: citaOriginal.idPersonal,
          idPaciente: citaOriginal.idPaciente ?? null,
          idConsultorio: citaOriginal.idConsultorio ?? null,
          idLugar: citaOriginal.idLugar ?? null,
          idServicio: servicio.id,
          tipoCita,
          idHistorialCita: citaOriginal.idHistorialCita ?? randomUUID(),
          idUsuarioProgramo: citaOriginal.idUsuarioProgramo,
          idUsuarioEnvio: idEjecutor,
        },
        usuarioAuditoria,
        idEjecutor,
        transaccion
      )

      citaOriginal.idCitaNueva = nuevaCitaId
      await this.citasRepository.guardarCita(citaOriginal, transaccion)
      await this.citasRepository.crearHistorialAccion(
        {
          idCita: citaOriginal.id,
          idEjecutor,
          comentario: 'Reprogramación por clonación',
          detalleCambios: this.crearDetalleCambiosEstado(
            CitasEstado.CONFIRMADA,
            CitasEstado.REPROGRAMADA
          ),
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
    this.validarEstado(cita, [CitasEstado.CONFIRMADA])
    const actualizado = await this.citasRepository.cancelarCita(
      id,
      dto,
      usuarioAuditoria,
      idEjecutor
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }
}
