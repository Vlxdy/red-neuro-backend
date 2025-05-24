export interface UsuarioRolResponse {
  id: string
  nombres: string
  primerApellido?: string | null
  segundoApellido?: string | null
  nroDocumento: string
  tipoDocumento: string
  genero?: string | null
  correoElectronico?: string | null
  urlFoto?: string | null
  estado: string
}

export class HistoriaClinicaResponse {
  id: string
  idPaciente: string
  idMedico: string
  observaciones: string | null
  estado: string
  paciente: UsuarioRolResponse
  medico?: UsuarioRolResponse
}

export interface CitaResponse {
  id: string
  detalle: string
  fechaInicio: Date | null | undefined
  fechaFin: Date | null | undefined
  estado: string
  paciente: UsuarioRolResponse | null
  medico: UsuarioRolResponse | null
}
