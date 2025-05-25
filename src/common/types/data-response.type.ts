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
  fechaNacimiento?: Date | null
  estado: string
}

export interface HistoriaClinicaResponse {
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

export interface EvaluacionNutricionalResponde {
  id: string
  peso: number
  talla: number
  imc: number
  requerimientoCalorico: number
  diagnostico: string
  idHistoriaClinica: string
  archivos?: ArchivoAdjuntoResponse[] | null
  fechaCreacion: Date
}
export interface ArchivoAdjuntoResponse {
  id: string
  nombreArchivo: string
  codigo: string | null
  tipoArchivo: string
  contenidoBase64: string | null // sin prefijo: solo el base64 puro
  idHistoriaClinica: string
  idEvaluacionNutricional: string
}
