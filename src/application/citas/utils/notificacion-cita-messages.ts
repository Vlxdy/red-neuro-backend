import dayjs from 'dayjs'
import { TipoCita } from '../constants'
import { Cita } from '../entities/cita.entity'

export enum EventoPushCita {
  CITA_SOLICITADA = 'CITA_SOLICITADA',
  CITA_CONFIRMADA = 'CITA_CONFIRMADA',
  CITA_RECHAZADA = 'CITA_RECHAZADA',
  CITA_CANCELADA = 'CITA_CANCELADA',
  CITA_REPROGRAMADA = 'CITA_REPROGRAMADA',
  CITA_NO_ASISTIO = 'CITA_NO_ASISTIO',
}

type MensajeCitaAccion =
  | 'REALIZADO'
  | 'ENVIADO'
  | 'REPROGRAMADO'
  | 'CONFIRMADO'
  | 'RECHAZADO'
  | 'CANCELADO'
  | 'MARCADO_NO_ASISTIO'

const TITULO_EVENTO_PUSH: Record<EventoPushCita, string> = {
  CITA_SOLICITADA: 'Nueva cita solicitada',
  CITA_CONFIRMADA: 'Cita confirmada',
  CITA_RECHAZADA: 'Cita rechazada',
  CITA_CANCELADA: 'Cita cancelada',
  CITA_REPROGRAMADA: 'Cita reprogramada',
  CITA_NO_ASISTIO: 'Cita marcada como no asistida',
}

function obtenerTipoCita(cita: Cita) {
  const esEstudio = cita.tipoCita === TipoCita.ESTUDIO

  return {
    nombre: esEstudio ? 'estudio' : 'consulta',
    articuloDefinido: esEstudio ? 'el' : 'la',
    articuloIndefinido: esEstudio ? 'un' : 'una',
  }
}

function obtenerNombreServicio(cita: Cita): string {
  return cita.servicio?.nombre?.trim() || 'servicio no especificado'
}

function obtenerFechaHora(cita: Cita): string {
  return cita.fechaInicio
    ? dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')
    : 'hora por confirmar'
}

export function construirMensajeNotificacionCita(params: {
  accionador: string
  accion: MensajeCitaAccion
  cita: Cita
}): string {
  const accionador = params.accionador.trim() || 'Personal de salud'
  const tipo = obtenerTipoCita(params.cita)
  const servicio = obtenerNombreServicio(params.cita)
  const fechaHora = obtenerFechaHora(params.cita)

  const mensajes: Record<MensajeCitaAccion, string> = {
    ENVIADO: `${accionador} te ha asignado ${tipo.articuloIndefinido} ${tipo.nombre}: ${servicio}, ${fechaHora}.`,
    CANCELADO: `${accionador} ha cancelado ${tipo.articuloDefinido} ${tipo.nombre}: ${servicio}, ${fechaHora}.`,
    REPROGRAMADO: `${accionador} ha reprogramado ${tipo.articuloDefinido} ${tipo.nombre}: ${servicio}, ${fechaHora}.`,
    CONFIRMADO: `${accionador} ha confirmado ${tipo.articuloDefinido} ${tipo.nombre}: ${servicio}, ${fechaHora}.`,
    RECHAZADO: `${accionador} ha rechazado ${tipo.articuloDefinido} ${tipo.nombre}: ${servicio}, ${fechaHora}.`,
    MARCADO_NO_ASISTIO: `${accionador} ha marcado como no asistida ${tipo.articuloDefinido} ${tipo.nombre}: ${servicio}, ${fechaHora}.`,
    REALIZADO: `${accionador} ha actualizado ${tipo.articuloDefinido} ${tipo.nombre}: ${servicio}, ${fechaHora}.`,
  }

  return mensajes[params.accion]
}

export function construirEventoPushCita(params: {
  evento: EventoPushCita
  citaId: string
}) {
  return {
    title: TITULO_EVENTO_PUSH[params.evento],
    data: {
      tipo: params.evento,
      idCita: params.citaId,
    },
  }
}
