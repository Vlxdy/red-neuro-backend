export interface UsuarioRolResponse {
  id: string
  nombres: string
  primerApellido?: string | null
  segundoApellido?: string | null
  nroDocumento: string
  tipoDocumento: string
  genero?: string | null
  correoElectronico?: string | null
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
