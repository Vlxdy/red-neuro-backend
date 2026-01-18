import dayjs from 'dayjs'
import { PacienteResponseDto } from '../dto/paciente.dto'
import { Paciente } from '../entities/paciente.entity'

export function formatearPaciente(paciente: Paciente): PacienteResponseDto {
  return {
    id: paciente.id,
    nombres: paciente.nombres,
    primerApellido: paciente.primerApellido ?? null,
    segundoApellido: paciente.segundoApellido ?? null,
    nroDocumento: paciente.nroDocumento ?? null,
    fechaNacimiento: paciente.fechaNacimiento
      ? dayjs(paciente.fechaNacimiento).toISOString()
      : null,
    telefono: paciente.telefono ?? null,
    genero: paciente.genero ?? null,
    observacion: paciente.observacion ?? null,
    estado: paciente.estado,
  }
}

export function formatearPacientes(
  pacientes: Paciente[]
): PacienteResponseDto[] {
  return pacientes.map((paciente) => formatearPaciente(paciente))
}
