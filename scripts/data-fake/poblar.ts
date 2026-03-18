import {
  runStep,
  step1_authenticateAdmin,
  step2_registerHealthcareStaff,
  step3_registerCategories,
  step4_registerServices,
  step5_registerPatients,
  step6_registerPlaces,
  step7_registerAppointments,
} from './populationSteps'

async function main() {
  const summary: string[] = []
  const separator = '------------------------------------------------------'

  console.log(`\n${separator}`)
  console.log('🚀 INICIANDO PROCESO DE POBLACIÓN DE BASE DE DATOS 🚀')
  console.log(`${separator}\n`)

  const steps = [
    {
      number: 1,
      name: 'AUTENTICACIÓN DEL ADMINISTRADOR',
      action: step1_authenticateAdmin,
    },
    {
      number: 2,
      name: 'REGISTRO DE PERSONAL DE SALUD (3 POR CADA ROL OPERATIVO)',
      action: step2_registerHealthcareStaff,
    },
    {
      number: 3,
      name: 'REGISTRO DE CATEGORÍAS (INCLUYE SEED)',
      action: step3_registerCategories,
    },
    {
      number: 4,
      name: 'REGISTRO DE SERVICIOS REALISTAS (INCLUYE SEED)',
      action: step4_registerServices,
    },
    {
      number: 5,
      name: 'REGISTRO DE PACIENTES (RESTO DE PERSONAS)',
      action: step5_registerPatients,
    },
    {
      number: 6,
      name: 'REGISTRO DE LUGARES',
      action: step6_registerPlaces,
    },
    {
      number: 7,
      name: 'REGISTRO DE CITAS CON LUGAR',
      action: step7_registerAppointments,
    },
  ]

  for (const step of steps) {
    const success = await runStep(step.number, step.name, step.action, summary)
    if (!success) {
      return
    }
  }

  console.log(`\n${separator}`)
  console.log('🎉 PROCESO DE POBLACIÓN DE BASE DE DATOS FINALIZADO 🎉')
  console.log(`${separator}`)

  console.log(`\n${separator}`)
  console.log('📊 RESUMEN FINAL DEL PROCESO:')
  console.log(`${separator}`)
  summary.forEach((line) => {
    console.log(`   ${line}`)
  })
  console.log(`${separator}\n`)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
