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
  telefono?: string | null
  estado: string
  rol: string
}

export interface ArchivoAdjuntoMetadataResponse {
  ruta: string
  tamanoBytes: number
  tipoMime: string
  nombreOriginal: string
}

export interface ArchivoAdjuntoResponse {
  id: string
  nombreArchivo: string
  codigo: string | null
  tipoArchivo: string
  contenidoBase64: string | null // sin prefijo: solo el base64 puro
  idHistoriaClinica: string
  idEvaluacionNutricional: string | null
  idAntecedente: string | null
  metadatos?: ArchivoAdjuntoMetadataResponse | null
  fechaCreacion?: Date | string
}

export interface AntecedenteResponse {
  antecedentesFamiliares?: string

  enfermedadDiagnosticada: boolean

  descripcionEnfermedad?: string

  sigueTratamiento: boolean

  descripcionTratamiento?: string

  tieneCirugia: boolean

  descripcionCirugia?: string

  // DATOS GASTROINTESTINALES

  tieneEstrenimiento: boolean

  tieneDiarrea: boolean

  tieneNauseas: boolean

  tieneVomitos: boolean

  frecuenciaEvacuacion?: string

  tipoDeposicion?: string

  // ALERGIAS E INTOLERANCIAS

  alergias?: string

  intolerancias?: string

  // DATOS GINECOLÓGICOS

  fechaUltimaMenstruacion?: string

  menstruacionRegular?: boolean

  metodoAnticonceptivo?: string

  colicos?: boolean

  // DIETAS ANTERIORES

  dietasAnteriores?: string

  id: string
  fechaCreacion: Date
  fechaModificacion?: Date | null
  fechaCierre?: Date | null
  idHistoriaClinica: string
  estado: string
  estadoRegistro: string
  motivoActualizacion?: string | null
  version: number
  fuenteDatos: string
  idEvaluacionNutricionalOrigen?: string | null

  archivos?: ArchivoAdjuntoResponse[] | null
}

export interface NotificacionResponse {
  id: string
  tipo: string
  mensaje: string
  visto?: boolean
  idCita?: string | null
  idPaciente: string
  idMedico?: string | null
  fechaCreacion: Date | string
  medico?: UsuarioRolResponse | null
}

export interface HistorialCitasResponse {
  id: string
  estadoAnterior: string
  estado: string
  comentario: string | null
  rolEjecutor: string
  usuarioEjecutor: UsuarioRolResponse
  fechaCreacion: Date | string
}
