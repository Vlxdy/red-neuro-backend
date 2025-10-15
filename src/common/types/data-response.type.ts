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

export interface EvaluacionAntropometricaRespuesta {
  circunferenciaCintura?: number | null
  circunferenciaCadera?: number | null
  cinturaCaderaRatio?: number | null
  pliegueTricipital?: number | null
  porcentajeGrasa?: number | null
  porcentajeMusculo?: number | null
  aguaCorporal?: number | null
}

export interface EvaluacionBioquimicaRespuesta {
  glucosa?: number | null
  colesterolTotal?: number | null
  trigliceridos?: number | null
  hdl?: number | null
  ldl?: number | null
  hemoglobina?: number | null
  ferritina?: number | null
}

export interface EvaluacionDieteticaRespuesta {
  caloriasTotales?: number | null
  numeroComidasDiarias?: number | null
  registroAlimentario?: Record<string, any> | null
  nivelConsumoAzucar?: number | null
  nivelHidratacion?: number | null
}

export interface EvaluacionClinicaRespuesta {
  patologiasPrevias?: string | null
  medicacionActual?: string | null
  nauseas?: boolean | null
  vomitos?: boolean | null
  diarrea?: boolean | null
  fatiga?: boolean | null
}

export interface EvaluacionPsicosocialRespuesta {
  nivelMotivacion?: number | null
  estresAlimentario?: number | null
  ansiedad?: number | null
  apoyoFamiliar?: number | null
  cumplimientoDieta?: number | null
}

export interface EvaluacionNutricionalResponde {
  id: string
  idHistoriaClinica: string
  fechaEvaluacion: string
  estado: string
  fechaCreacion: Date | string
  peso?: number | null
  talla?: number | null
  imc?: number | null
  diagnosticoNutricional?: string | null
  observaciones?: string | null
  archivos?: ArchivoAdjuntoResponse[] | null
  antropometria?: EvaluacionAntropometricaRespuesta | null
  bioquimica?: EvaluacionBioquimicaRespuesta | null
  dietetica?: EvaluacionDieteticaRespuesta | null
  clinica?: EvaluacionClinicaRespuesta | null
  psicosocial?: EvaluacionPsicosocialRespuesta | null
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
  fechaCreacion: Date | string
  medico?: UsuarioRolResponse | null
}
