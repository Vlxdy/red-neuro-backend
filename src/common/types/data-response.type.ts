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

  idHistoriaClinica: string
  archivos?: ArchivoAdjuntoResponse[] | null
  fechaCreacion: Date | string

  estado: string

  peso?: number | null

  pesoCompeticion?: number | null

  pesoObjetivo?: number | null

  estatura?: number | null

  envergadura?: number | null
  estaturaSentada?: number | null

  triceps?: number | null

  subescapular?: number | null

  biceps?: number | null

  crestaIliaca?: number | null

  supraEspinal?: number | null

  abdominal?: number | null

  muslo?: number | null

  pierna?: number | null

  brazoRelajado?: number | null

  brazoFlexContraido?: number | null

  cintura?: number | null

  caderas?: number | null

  musloMedio?: number | null

  piernaPerimetro?: number | null

  humero?: number | null

  biEstiloideo?: number | null

  femur?: number | null

  requerimientoCalorico?: number | null

  diagnostico?: string

  imc?: number | null
  masaGrasa?: number | null
  masaLibreGrasa?: number | null
  relacionCinturaCadera?: number | null
  pesoResidual?: number | null
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
  idHistoriaClinica: string
  estado: string

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
  medico?: UsuarioRolResponse | null
}
