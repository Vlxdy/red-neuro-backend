// src/scripts/populationSteps.ts

import { loginYConfigurarToken } from './helpers/loginAdmin'
import {
  asignarPacientes,
  getNutricionistasPorFiltro,
  getPacientesPorAsignar,
  getPacientesPorMedico,
} from './helpers/obtener.usuarios'
import { UsuarioRolResponse } from '@/common/types/data-response.type'
import { loginYConfigurarTokenNutriologo } from './helpers/loginNutriologo'
import dayjs from 'dayjs'
import { generarCitas } from './helpers/citas'
import { personasFake } from './data/usuarios.fake'
import {
  crearArmarUsuario,
  registrarUsuariosEnGrupos,
} from './helpers/usuarios'
import { generarEvaluacionNutricional } from './helpers/evaluacion'
import { getHistoriaClinicaPorPaciente } from './helpers/historia'
import { crearPlanNutricional } from './helpers/planes_nutricionales'

const separator = '------------------------------------------------------'

/**
 * Helper function to run a step with consistent logging and error handling.
 * @param stepNumber The number of the current step.
 * @param stepName The name of the current step.
 * @param action The asynchronous function to execute for this step.
 * @param summary Array to push summary messages into.
 * @returns true if the step succeeded, false if it failed critically.
 */
export async function runStep(
  stepNumber: number,
  stepName: string,
  action: (summary: string[]) => Promise<void | boolean>, // Action now receives summary directly
  summary: string[]
): Promise<boolean> {
  console.log(`\n${separator}`)
  console.log(`✨ PASO ${stepNumber}: ${stepName}`)
  console.log(`${separator}`)

  try {
    const result = await action(summary) // Pass summary to the action
    if (result === false) {
      // If action explicitly returned false, it means a non-critical exit
      console.log(`\n${separator}`)
      console.log(`⚠️ PASO ${stepNumber} COMPLETADO CON ADVERTENCIAS.`)
      console.log(`${separator}\n`)
      return false // Indicate that it didn't fully succeed, but wasn't critical error
    }
    console.log(`\n${separator}`)
    console.log(`✅ PASO ${stepNumber} COMPLETADO EXITOSAMENTE.`)
    console.log(`${separator}\n`)
    return true
  } catch (error: any) {
    console.error(
      `   ❌ Error crítico en el PASO ${stepNumber} (${stepName}): ${error.message}`
    )
    console.log(`\n${separator}`)
    console.log(
      `❌ PROCESO ABORTADO DEBIDO A UN ERROR CRÍTICO EN PASO ${stepNumber}.`
    )
    console.log(`${separator}`)
    return false // Indicate critical failure
  }
}

// --- Individual Step Functions ---

export async function step1_authenticateAdmin(
  summary: string[]
): Promise<void> {
  console.log('   🔄 Obteniendo token JWT para el usuario ADMINISTRADOR...')
  await loginYConfigurarToken('ADMINISTRADOR', '123')
  console.log('   ✅ Token JWT de ADMINISTRADOR configurado exitosamente.')
  summary.push('✅ Paso 1: Autenticación del Administrador - Exitosa')
}

export async function step2_registerInitialNutritionists(
  summary: string[]
): Promise<void> {
  let nutricionistasRegistradosCount = 0

  const NUTRICIONISTA1 = personasFake[0]
  console.log(
    `   🔄 Registrando Nutricionista 1: ${NUTRICIONISTA1.persona.nombres} ${NUTRICIONISTA1.persona.primerApellido}...`
  )
  await crearArmarUsuario(NUTRICIONISTA1, ['2'])
  console.log(
    `   ✅ Nutricionista 1 (${NUTRICIONISTA1.usuario}) registrado correctamente.`
  )
  nutricionistasRegistradosCount++

  const NUTRICIONISTA2 = personasFake[1]
  console.log(
    `   🔄 Registrando Nutricionista 2: ${NUTRICIONISTA2.persona.nombres} ${NUTRICIONISTA2.persona.primerApellido}...`
  )
  await crearArmarUsuario(NUTRICIONISTA2, ['2'])
  console.log(
    `   ✅ Nutricionista 2 (${NUTRICIONISTA2.usuario}) registrado correctamente.`
  )
  nutricionistasRegistradosCount++

  summary.push(
    `✅ Paso 2: Registro de Nutricionistas - ${nutricionistasRegistradosCount} registrados`
  )
}

export async function step3_bulkRegisterPatients(
  summary: string[]
): Promise<void> {
  const pacientesToRegister = personasFake.slice(2)
  // registrarUsuariosEnGrupos will handle its own detailed batch logging
  await registrarUsuariosEnGrupos(pacientesToRegister)
  const pacientesRegistradosCount = pacientesToRegister.length // Assuming all attempted users in the slice are registered
  console.log(
    `   ✅ Proceso de registro de pacientes completado. Intentados: ${pacientesRegistradosCount}`
  )
  summary.push(
    `✅ Paso 3: Registro Masivo de Pacientes - ${pacientesRegistradosCount} intentados`
  )
}

let globalMedico: UsuarioRolResponse | undefined // To share the medico across steps

export async function step4_assignPatientsToNutritionist(
  summary: string[]
): Promise<void | boolean> {
  let pacientesAsignadosCount = 0
  console.log('   🔄 Obteniendo nutricionistas disponibles...')
  const obtenerNutricionistas: UsuarioRolResponse[] =
    await getNutricionistasPorFiltro()

  globalMedico = obtenerNutricionistas[0]
  if (!globalMedico) {
    console.error(
      '   ❌ No se encontró un nutricionista disponible para asignar pacientes.'
    )
    summary.push(
      '⚠️ Paso 4: Asignación de Pacientes - Nutricionista no encontrado'
    )
    return false // Indicate a non-critical exit for the step
  }
  console.log(
    `   ✅ Nutricionista seleccionado: ${globalMedico.nombres} ${globalMedico.primerApellido} (ID: ${globalMedico.id}).`
  )

  console.log(
    `   🔄 Obteniendo pacientes por asignar para el nutricionista ${globalMedico.nombres}...`
  )
  const pacientesPorAsignar: UsuarioRolResponse[] =
    await getPacientesPorAsignar({
      limite: 50,
      idMedico: globalMedico.id,
    })

  if (!pacientesPorAsignar || pacientesPorAsignar.length === 0) {
    console.warn(
      '   ⚠️ No se encontraron pacientes pendientes de asignar para este nutricionista.'
    )
    summary.push(
      '⚠️ Paso 4: Asignación de Pacientes - No hay pacientes para asignar'
    )
    return false // Indicate a non-critical exit for the step
  } else {
    console.log(
      `   ✅ ${pacientesPorAsignar.length} pacientes encontrados para asignar.`
    )

    console.log(
      `   🔄 Asignando ${pacientesPorAsignar.length} pacientes al nutricionista ${globalMedico.nombres}...`
    )
    await asignarPacientes({
      idMedico: globalMedico.id,
      idPacientes: pacientesPorAsignar.map((paciente) => paciente.id),
    })
    pacientesAsignadosCount = pacientesPorAsignar.length
    console.log(
      `   ✅ ${pacientesAsignadosCount} pacientes asignados correctamente.`
    )
    summary.push(
      `✅ Paso 4: Asignación de Pacientes - ${pacientesAsignadosCount} asignados`
    )
  }
}

export async function step5_authenticateNutriologist(
  summary: string[]
): Promise<void> {
  if (!globalMedico) {
    throw new Error(
      'No se encontró un médico para autenticar al nutriólogo. Paso 4 pudo haber fallado.'
    )
  }
  console.log('   🔄 Obteniendo token JWT para el usuario NUTRICIONISTA...')
  // Use the nroDocumento from the selected nutritionist for login
  await loginYConfigurarTokenNutriologo(globalMedico.nroDocumento, '123')
  console.log('   ✅ Token JWT de NUTRICIONISTA configurado exitosamente.')
  summary.push('✅ Paso 5: Autenticación del Nutriólogo - Exitosa')
}

export async function step6_generateAppointmentsAndEvaluations(
  summary: string[]
): Promise<void | boolean> {
  let evaluacionesCreadasCount = 0

  if (!globalMedico) {
    console.warn(
      '   ⚠️ No hay médico seleccionado para generar citas y evaluaciones. Saltando este paso.'
    )
    summary.push(
      '⚠️ Paso 6: Generación de Citas y Evaluaciones - Saltado (No hay médico)'
    )
    return false // Indicate a non-critical exit for the step
  }
  console.log('   🔄 Generando citas para pacientes asignados...')
  const pacientesAsignadosParaCitas = await getPacientesPorMedico({
    limite: 50,
    idMedico: globalMedico.id,
  })

  const { PacienteCitasCreadas: pacientesCitaGenerada, TotalCitasCreada } =
    await generarCitas({
      fechaBase: dayjs().add(-3, 'month').toString(),
      pacientes: pacientesAsignadosParaCitas,
    })

  if (!pacientesCitaGenerada || pacientesCitaGenerada.length === 0) {
    console.warn('   ⚠️ No se generaron citas para los pacientes asignados.')
    summary.push(
      '⚠️ Paso 6: Generación de Citas y Evaluaciones - No hay citas generadas'
    )
    return false // Indicate a non-critical exit for the step
  } else {
    console.log(`   ✅ ${TotalCitasCreada} citas generadas correctamente.`)

    console.log(
      '   🔄 Creando evaluaciones nutricionales para las citas generadas...'
    )
    for await (const element of pacientesCitaGenerada) {
      const historia = await getHistoriaClinicaPorPaciente({
        idPaciente: element.paciente.id,
      })
      const evaluacionesGeneradas = await generarEvaluacionNutricional({
        citasGenerasdas: element,
        historia,
      })
      evaluacionesCreadasCount += evaluacionesGeneradas
    }
    console.log(
      `   ✅ ${evaluacionesCreadasCount} evaluaciones nutricionales creadas exitosamente.`
    )

    let contadorPlanesNutricionales = 0
    for await (const element of pacientesAsignadosParaCitas) {
      try {
        await crearPlanNutricional({ idUsuarioRol: element.id })
        contadorPlanesNutricionales++
      } catch (error) {
        // Error already logged in crearPlanNutricional
        console.error(
          `   ⚠️ Error al crear plan nutricional para paciente ${element.id}: ${error.message}`
        )
      }
    }
    console.log(
      `   ✅ Planes nutricionales creados para ${contadorPlanesNutricionales} pacientes.`
    )

    summary.push(
      `✅ Paso 6: Generación de Citas y Evaluaciones - ${TotalCitasCreada} citas y ${evaluacionesCreadasCount} evaluaciones`
    )
  }
}
