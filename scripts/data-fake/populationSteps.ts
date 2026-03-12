import dayjs from 'dayjs'
import apiAdmin, { loginYConfigurarToken } from './helpers/loginAdmin'
import { personasFake, UsuarioFake } from './data/usuarios.fake'
import { TipoLugar } from '@/application/lugar/constants'

const separator = '------------------------------------------------------'
const DEFAULT_PASSWORD = '1234'
const PERSONAL_SALUD_COUNT = 10

type CategoriaCreada = { id: string; nombre: string }
type ServicioCreado = {
  id: string
  nombre: string
  tipo: 'CONSULTA' | 'ESTUDIO'
}
type PersonalCreado = { id: string; nombreCompleto: string; usuario: string }
type PacienteCreado = { id: string; nombreCompleto: string }
type LugarCreado = { id: string; nombre: string }

type CategoriaSeed = {
  nombre: string
  descripcion: string
  colorHex: string
}

type ServicioSeed = {
  nombre: string
  descripcion: string
  tipo: 'CONSULTA' | 'ESTUDIO'
  duracionMinutos: number
  costo: number
  categorias: string[]
}

const especialidades = [
  'Cardiología',
  'Neurología',
  'Medicina Interna',
  'Pediatría',
  'Ginecología',
  'Nutrición',
  'Dermatología',
  'Traumatología',
  'Psicología',
  'Medicina General',
]

const categoriasSeed: CategoriaSeed[] = [
  {
    nombre: 'Cardiología',
    descripcion: 'Categoría enfocada en corazón y sistema vascular.',
    colorHex: '#ef4444',
  },
  {
    nombre: 'Neurología',
    descripcion: 'Categoría del sistema nervioso central y periférico.',
    colorHex: '#8b5cf6',
  },
  {
    nombre: 'Radiología',
    descripcion: 'Categoría orientada a imágenes diagnósticas.',
    colorHex: '#3b82f6',
  },
  {
    nombre: 'Laboratorio Clínico',
    descripcion: 'Categoría para análisis clínicos y biomarcadores.',
    colorHex: '#0ea5e9',
  },
  {
    nombre: 'Nutrición',
    descripcion: 'Evaluación y manejo nutricional integral.',
    colorHex: '#10b981',
  },
  {
    nombre: 'Medicina General',
    descripcion: 'Consultas de valoración y seguimiento general.',
    colorHex: '#f59e0b',
  },
  {
    nombre: 'Salud de la Mujer',
    descripcion: 'Atención integral y preventiva para mujeres.',
    colorHex: '#ec4899',
  },
  {
    nombre: 'Rehabilitación',
    descripcion: 'Recuperación funcional y control de lesiones.',
    colorHex: '#14b8a6',
  },
  {
    nombre: 'Salud Mental',
    descripcion: 'Atención psicológica y soporte terapéutico.',
    colorHex: '#6366f1',
  },
  {
    nombre: 'Pediatría',
    descripcion: 'Atención de niños y adolescentes.',
    colorHex: '#22c55e',
  },
]

const serviciosSeed: ServicioSeed[] = [
  {
    nombre: 'Consulta General',
    descripcion: 'Consulta médica de primera valoración.',
    tipo: 'CONSULTA',
    duracionMinutos: 30,
    costo: 120.5,
    categorias: ['Medicina General'],
  },
  {
    nombre: 'Control Nutricional',
    descripcion: 'Seguimiento de plan alimentario y hábitos.',
    tipo: 'CONSULTA',
    duracionMinutos: 25,
    costo: 90.0,
    categorias: ['Nutrición'],
  },
  {
    nombre: 'Electrocardiograma',
    descripcion: 'Registro de actividad eléctrica cardiaca.',
    tipo: 'ESTUDIO',
    duracionMinutos: 20,
    costo: 150.75,
    categorias: ['Cardiología'],
  },
  {
    nombre: 'Consulta Neurológica',
    descripcion: 'Evaluación clínica del sistema nervioso.',
    tipo: 'CONSULTA',
    duracionMinutos: 35,
    costo: 180,
    categorias: ['Neurología'],
  },
  {
    nombre: 'Ecografía Abdominal',
    descripcion: 'Estudio por imagen de órganos abdominales.',
    tipo: 'ESTUDIO',
    duracionMinutos: 30,
    costo: 210,
    categorias: ['Radiología'],
  },
  {
    nombre: 'Perfil Lipídico',
    descripcion: 'Análisis de colesterol total, HDL, LDL y triglicéridos.',
    tipo: 'ESTUDIO',
    duracionMinutos: 15,
    costo: 95,
    categorias: ['Laboratorio Clínico', 'Cardiología'],
  },
  {
    nombre: 'Consulta Pediátrica de Control',
    descripcion: 'Control de crecimiento y desarrollo infantil.',
    tipo: 'CONSULTA',
    duracionMinutos: 30,
    costo: 130,
    categorias: ['Pediatría'],
  },
  {
    nombre: 'Evaluación Psicológica Inicial',
    descripcion: 'Valoración del estado emocional y conductual.',
    tipo: 'CONSULTA',
    duracionMinutos: 45,
    costo: 160,
    categorias: ['Salud Mental'],
  },
  {
    nombre: 'Rehabilitación Física',
    descripcion: 'Sesión terapéutica para recuperación funcional.',
    tipo: 'CONSULTA',
    duracionMinutos: 40,
    costo: 140,
    categorias: ['Rehabilitación', 'Traumatología'],
  },
  {
    nombre: 'Control Prenatal',
    descripcion: 'Seguimiento integral del embarazo.',
    tipo: 'CONSULTA',
    duracionMinutos: 30,
    costo: 155,
    categorias: ['Salud de la Mujer'],
  },
]

const lugaresSeed = [
  {
    nombre: 'Hospital General Red Neuro',
    sigla: 'HGRN',
    direccion: 'Av. Principal #1200, Zona Norte',
    tipo: TipoLugar.HOSPITAL,
  },
  {
    nombre: 'Clínica Central Red Neuro',
    sigla: 'CCRN',
    direccion: 'Calle Comercio #455, Centro',
    tipo: TipoLugar.CLINICA,
  },
  {
    nombre: 'Centro de Salud Miraflores',
    sigla: 'CSM',
    direccion: 'Av. Busch #980, Miraflores',
    tipo: TipoLugar.CENTRO_SALUD,
  },
  {
    nombre: 'Centro de Diagnóstico Imagen Vida',
    sigla: 'DIV',
    direccion: 'Calle 10 de Calacoto #105',
    tipo: TipoLugar.CLINICA,
  },
]

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { mensaje?: string } } })
      .response
    if (response?.data?.mensaje) {
      return response.data.mensaje
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Error no identificado'
}

/**
 * Helper function to run a step with consistent logging and error handling.
 */
export async function runStep(
  stepNumber: number,
  stepName: string,
  action: (summary: string[]) => Promise<void | boolean>,
  summary: string[]
): Promise<boolean> {
  console.log(`\n${separator}`)
  console.log(`✨ PASO ${stepNumber}: ${stepName}`)
  console.log(`${separator}`)

  try {
    const result = await action(summary)
    if (result === false) {
      console.log(`\n${separator}`)
      console.log(`⚠️ PASO ${stepNumber} COMPLETADO CON ADVERTENCIAS.`)
      console.log(`${separator}\n`)
      return false
    }
    console.log(`\n${separator}`)
    console.log(`✅ PASO ${stepNumber} COMPLETADO EXITOSAMENTE.`)
    console.log(`${separator}\n`)
    return true
  } catch (error: unknown) {
    console.error(
      `   ❌ Error crítico en el PASO ${stepNumber} (${stepName}): ${getErrorMessage(error)}`
    )
    console.log(`\n${separator}`)
    console.log(
      `❌ PROCESO ABORTADO DEBIDO A UN ERROR CRÍTICO EN PASO ${stepNumber}.`
    )
    console.log(`${separator}`)
    return false
  }
}

let personalSaludGlobal: PersonalCreado[] = []
let categoriasGlobal: CategoriaCreada[] = []
let serviciosGlobal: ServicioCreado[] = []
let pacientesGlobal: PacienteCreado[] = []
let lugaresGlobal: LugarCreado[] = []

export async function step1_authenticateAdmin(
  summary: string[]
): Promise<void> {
  console.log('   🔄 Autenticando usuario ADMINISTRADOR...')
  await loginYConfigurarToken('ADMINISTRADOR', DEFAULT_PASSWORD)
  console.log('   ✅ Token JWT de ADMINISTRADOR configurado correctamente.')
  summary.push('✅ Paso 1: Autenticación ADMINISTRADOR - Exitosa')
}

export async function step2_registerHealthcareStaff(
  summary: string[]
): Promise<void> {
  const basePersonalSalud = personasFake.slice(0, PERSONAL_SALUD_COUNT)
  console.log(
    `   🔄 Registrando ${basePersonalSalud.length} personales de salud (primeras personas del fake)...`
  )

  let creados = 0
  for (let i = 0; i < basePersonalSalud.length; i++) {
    const persona = basePersonalSalud[i]
    const payload = {
      usuario: `psalud_${persona.usuario}`,
      contrasena: DEFAULT_PASSWORD,
      repetirContrasena: DEFAULT_PASSWORD,
      correoElectronico: `psalud.${persona.usuario}@seed.local`,
      persona: {
        ...persona.persona,
      },
      ocupacion: especialidades[i % especialidades.length],
      esSupervisor: i === 0,
    }

    try {
      const res = await apiAdmin.post('/personal-salud', payload)
      const creado = res.data?.datos
      if (creado?.id) {
        personalSaludGlobal.push({
          id: creado.id,
          nombreCompleto:
            `${creado.nombres} ${creado.primerApellido ?? ''}`.trim(),
          usuario: payload.usuario,
        })
        creados++
      }
    } catch (error: unknown) {
      console.warn(
        `   ⚠️ Personal no registrado (${payload.usuario}): ${getErrorMessage(error)}`
      )
    }
  }

  console.log(`   ✅ Personal de salud registrado: ${creados}`)
  summary.push(`✅ Paso 2: Personal de salud - ${creados} registrados`)
}

export async function step3_registerCategories(
  summary: string[]
): Promise<void> {
  console.log(
    `   🔄 Registrando categorías realistas (incluye categorías del seed)...`
  )

  let creadas = 0
  for (const payload of categoriasSeed) {
    try {
      const res = await apiAdmin.post('/categorias', payload)
      const categoria = res.data?.datos
      if (categoria?.id) {
        categoriasGlobal.push({ id: categoria.id, nombre: categoria.nombre })
        creadas++
      }
    } catch (error: unknown) {
      console.warn(
        `   ⚠️ Categoría no registrada (${payload.nombre}): ${getErrorMessage(error)}`
      )
    }
  }

  console.log(`   ✅ Categorías registradas: ${creadas}`)
  summary.push(`✅ Paso 3: Categorías - ${creadas} registradas`)
}

export async function step4_registerServices(summary: string[]): Promise<void> {
  if (categoriasGlobal.length === 0) {
    console.warn('   ⚠️ No hay categorías para asociar servicios.')
    summary.push('⚠️ Paso 4: Servicios - sin categorías')
    return
  }

  const categoriaIdPorNombre = new Map(
    categoriasGlobal.map((categoria) => [categoria.nombre, categoria.id])
  )

  console.log(
    '   🔄 Registrando servicios realistas (incluye servicios del seed) con categorías asociadas...'
  )

  let creados = 0
  for (const servicio of serviciosSeed) {
    const categoriaIds = servicio.categorias
      .map((nombre) => categoriaIdPorNombre.get(nombre))
      .filter((id): id is string => !!id)

    const payload = {
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      tipo: servicio.tipo,
      duracionMinutos: servicio.duracionMinutos,
      costo: servicio.costo,
      categoriaIds,
    }

    try {
      const res = await apiAdmin.post('/servicios', payload)
      const creado = res.data?.datos
      if (creado?.id) {
        serviciosGlobal.push({
          id: creado.id,
          nombre: creado.nombre,
          tipo: creado.tipo,
        })
        creados++
      }
    } catch (error: unknown) {
      console.warn(
        `   ⚠️ Servicio no registrado (${payload.nombre}): ${getErrorMessage(error)}`
      )
    }
  }

  console.log(`   ✅ Servicios registrados: ${creados}`)
  summary.push(`✅ Paso 4: Servicios - ${creados} registrados`)
}

export async function step5_registerPatients(summary: string[]): Promise<void> {
  const basePacientes = personasFake.slice(PERSONAL_SALUD_COUNT)
  console.log(
    `   🔄 Registrando ${basePacientes.length} pacientes (resto de personas fake)...`
  )

  let creados = 0
  for (let i = 0; i < basePacientes.length; i++) {
    const persona: UsuarioFake = basePacientes[i]

    const payload = {
      nombres: persona.persona.nombres,
      primerApellido: persona.persona.primerApellido,
      segundoApellido: persona.persona.segundoApellido,
      nroDocumento: persona.persona.nroDocumento,
      fechaNacimiento: dayjs(persona.persona.fechaNacimiento).format(
        'YYYY-MM-DD'
      ),
      telefono: persona.persona.telefono,
      genero: persona.persona.genero,
      observacion:
        i % 4 === 0
          ? 'Paciente de seguimiento trimestral por control preventivo.'
          : 'Paciente de control regular con historial clínico activo.',
    }

    try {
      const res = await apiAdmin.post('/pacientes', payload)
      const paciente = res.data?.datos
      if (paciente?.id) {
        pacientesGlobal.push({
          id: paciente.id,
          nombreCompleto:
            `${paciente.nombres} ${paciente.primerApellido ?? ''}`.trim(),
        })
        creados++
      }
    } catch (error: unknown) {
      console.warn(
        `   ⚠️ Paciente no registrado (${payload.nroDocumento}): ${getErrorMessage(error)}`
      )
    }
  }

  console.log(`   ✅ Pacientes registrados: ${creados}`)
  summary.push(`✅ Paso 5: Pacientes - ${creados} registrados`)
}

export async function step6_registerPlaces(summary: string[]): Promise<void> {
  console.log('   🔄 Registrando lugares para asignar citas...')

  let creados = 0
  for (const payload of lugaresSeed) {
    try {
      const res = await apiAdmin.post('/lugares', payload)
      const lugar = res.data?.datos
      if (lugar?.id) {
        lugaresGlobal.push({ id: lugar.id, nombre: lugar.nombre })
        creados++
      }
    } catch (error: unknown) {
      console.warn(
        `   ⚠️ Lugar no registrado (${payload.nombre}): ${getErrorMessage(error)}`
      )
    }
  }

  console.log(`   ✅ Lugares registrados: ${creados}`)
  summary.push(`✅ Paso 6: Lugares - ${creados} registrados`)
}

export async function step7_registerAppointments(
  summary: string[]
): Promise<void | boolean> {
  if (
    pacientesGlobal.length === 0 ||
    serviciosGlobal.length === 0 ||
    personalSaludGlobal.length === 0 ||
    lugaresGlobal.length === 0
  ) {
    console.warn('   ⚠️ Faltan datos previos para crear citas.')
    summary.push('⚠️ Paso 7: Citas - omitido por falta de datos base')
    return false
  }

  const totalCitas = Math.max(pacientesGlobal.length * 2, 120)
  console.log(`   🔄 Registrando ${totalCitas} citas realistas...`)

  let creadas = 0
  for (let i = 0; i < totalCitas; i++) {
    const paciente = pacientesGlobal[i % pacientesGlobal.length]
    const personal = personalSaludGlobal[i % personalSaludGlobal.length]
    const servicio = serviciosGlobal[i % serviciosGlobal.length]
    const lugar = lugaresGlobal[i % lugaresGlobal.length]

    const payload = {
      accion: i % 6 === 0 ? 'GUARDAR' : 'ENVIAR',
      detalle: `Atención programada: ${servicio.nombre} para ${paciente.nombreCompleto}`,
      fechaInicio: dayjs()
        .add(2 + (i % 35), 'day')
        .hour(8 + (i % 9))
        .minute(i % 2 === 0 ? 0 : 30)
        .second(0)
        .millisecond(0)
        .toISOString(),
      idPaciente: paciente.id,
      idPersonal: personal.id,
      idLugar: lugar.id,
      tipoCita: servicio.tipo,
      idServicio: servicio.id,
    }

    try {
      await apiAdmin.post('/citas', payload)
      creadas++
    } catch (error: unknown) {
      console.warn(
        `   ⚠️ Cita no registrada (paciente ${paciente.id}, lugar ${lugar.nombre}): ${getErrorMessage(error)}`
      )
    }
  }

  console.log(`   ✅ Citas registradas: ${creadas}`)
  summary.push(`✅ Paso 7: Citas - ${creadas} registradas`)
}
