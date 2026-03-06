import dayjs from 'dayjs'
import {
  CitaNuevaDetalleDto,
  CitaResponseDto,
  EspecialidadCitaDto,
  LugarCitaDto,
  ServicioCitaDto,
} from '../dto/cita.dto'
import { Cita } from '../entities/cita.entity'
import { formatearPersonal } from '@/application/personal/utils/formateo-personal.utils'
import { formatearPaciente } from '@/application/paciente/utils/formateo-paciente'
import { formatearConsultorio } from '@/application/consultorio/utils/formateo.consultorio'
import { Servicio } from '@/application/servicio/entities/servicio.entity'

const formatearEspecialidad = (
  especialidad: Cita['especialidad']
): EspecialidadCitaDto | undefined => {
  if (!especialidad) {
    return undefined
  }
  return {
    id: especialidad.id,
    nombre: especialidad.nombre,
    descripcion: especialidad.descripcion,
    colorHex: especialidad.colorHex,
    estado: especialidad.estado,
  }
}

const formatearLugar = (lugar: Cita['lugar']): LugarCitaDto | undefined => {
  if (!lugar) {
    return undefined
  }
  return {
    id: lugar.id,
    nombre: lugar.nombre,
    sigla: lugar.sigla,
    direccion: lugar.direccion,
    estado: lugar.estado,
  }
}

const formatearCitaNueva = (
  cita?: Cita | null
): CitaNuevaDetalleDto | undefined => {
  if (!cita) {
    return undefined
  }
  return {
    id: cita.id,
    detalle: cita.detalle,
    fechaInicio: dayjs(cita.fechaInicio).toISOString(),
    fechaFin: dayjs(cita.fechaFin).toISOString(),
    tipoCita: cita.tipoCita,
    estado: cita.estado,
    idPersonal: cita.idPersonal,
    pacienteId: cita.idPaciente ?? undefined,
    consultorioId: cita.idConsultorio ?? undefined,
    lugarId: cita.idLugar ?? undefined,
    especialidadId: cita.idEspecialidad ?? undefined,
    servicioId: cita.idServicio ?? undefined,
    personal: cita.personal ? formatearPersonal(cita.personal) : undefined,
    paciente: cita.paciente ? formatearPaciente(cita.paciente) : undefined,
    especialidad: formatearEspecialidad(cita.especialidad),
    servicio: cita.servicio ? formatearServicio(cita.servicio) : undefined,
    consultorio: cita.consultorio
      ? formatearConsultorio(cita.consultorio)
      : undefined,
    lugar: formatearLugar(cita.lugar),
  }
}

export const formatearServicio = (servicio: Servicio): ServicioCitaDto => {
  return {
    id: servicio.id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion ?? '',
    tipo: servicio.tipo,
    duracionMinutos: servicio.duracionMinutos,
    costo: Number(servicio.costo),
    estado: servicio.estado,
  }
}

export function formatearCita(cita: Cita): CitaResponseDto {
  return {
    id: cita.id,
    detalle: cita.detalle,
    fechaInicio: dayjs(cita.fechaInicio).toISOString(),
    fechaFin: dayjs(cita.fechaFin).toISOString(),
    idPersonal: cita.idPersonal,
    pacienteId: cita.idPaciente ?? undefined,
    consultorioId: cita.idConsultorio ?? undefined,
    lugarId: cita.idLugar ?? undefined,
    especialidadId: cita.idEspecialidad ?? undefined,
    servicioId: cita.idServicio ?? undefined,
    estado: cita.estado,
    tipoCita: cita.tipoCita,
    citaNuevaId: cita.idCitaNueva ?? undefined,
    citaNueva: formatearCitaNueva(cita.citaNueva),
    historialCitaId: cita.idHistorialCita ?? undefined,
    usuarioProgramoId: cita.idUsuarioProgramo ?? undefined,
    usuarioProgramo: cita.usuarioProgramo
      ? formatearPersonal(cita.usuarioProgramo)
      : undefined,
    usuarioEnvioId: cita.idUsuarioEnvio ?? undefined,
    usuarioEnvio: cita.usuarioEnvio
      ? formatearPersonal(cita.usuarioEnvio)
      : undefined,
    personal: cita.personal ? formatearPersonal(cita.personal) : undefined,
    paciente: cita.paciente ? formatearPaciente(cita.paciente) : undefined,
    especialidad: formatearEspecialidad(cita.especialidad),
    servicio: cita.servicio ? formatearServicio(cita.servicio) : undefined,
    consultorio: cita.consultorio
      ? formatearConsultorio(cita.consultorio)
      : undefined,
    lugar: formatearLugar(cita.lugar),
  }
}

export function formatearCitas(citas: Cita[]): CitaResponseDto[] {
  return citas.map((cita) => formatearCita(cita))
}
