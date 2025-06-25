// src/scripts/main.ts (or original file)

import {
  runStep,
  step1_authenticateAdmin,
  step2_registerInitialNutritionists,
  step3_bulkRegisterPatients,
  step4_assignPatientsToNutritionist,
  step5_authenticateNutriologist,
  step6_generateAppointmentsAndEvaluations,
} from './populationSteps' // Import your new modular steps

async function main() {
  const summary: string[] = [] // To store a summary of each step
  const separator = '------------------------------------------------------'

  console.log(`\n${separator}`)
  console.log('🚀 INICIANDO PROCESO DE POBLACIÓN DE BASE DE DATOS 🚀')
  console.log(`${separator}\n`)

  // Define steps as an array of objects
  const steps = [
    {
      number: 1,
      name: 'AUTENTICACIÓN DEL ADMINISTRADOR',
      action: step1_authenticateAdmin,
    },
    {
      number: 2,
      name: 'REGISTRO DE NUTRICIONISTAS INICIALES',
      action: step2_registerInitialNutritionists,
    },
    {
      number: 3,
      name: 'REGISTRO MASIVO DE PACIENTES',
      action: step3_bulkRegisterPatients,
    },
    {
      number: 4,
      name: 'ASIGNACIÓN DE PACIENTES A NUTRICIONISTA',
      action: step4_assignPatientsToNutritionist,
    },
    {
      number: 5,
      name: 'AUTENTICACIÓN DEL NUTRIÓLOGO',
      action: step5_authenticateNutriologist,
    },
    {
      number: 6,
      name: 'GENERACIÓN DE CITAS Y EVALUACIONES',
      action: step6_generateAppointmentsAndEvaluations,
    },
    // Add more steps here easily!
  ]

  for (const step of steps) {
    const success = await runStep(step.number, step.name, step.action, summary)
    if (!success) {
      // If runStep returned false, it means a critical error occurred and the process was aborted
      // The error message and aborted status are already logged by runStep
      return
    }
  }

  // ---
  // PROCESO FINALIZADO
  // ---
  console.log(`\n${separator}`)
  console.log('🎉 PROCESO DE POBLACIÓN DE BASE DE DATOS FINALIZADO 🎉')
  console.log(`${separator}`)

  // ---
  // RESUMEN FINAL DEL PROCESO
  // ---
  console.log(`\n${separator}`)
  console.log('📊 RESUMEN FINAL DEL PROCESO:')
  console.log(`${separator}`)
  summary.forEach((line) => {
    // No need for index if it's already in the summary line
    console.log(`   ${line}`) // Indent summary lines for better readability
  })
  console.log(`${separator}\n`)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
