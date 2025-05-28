// import { Usuario } from '@/core/usuario/entity/usuario.entity'
import AppDataSource from 'ormconfig-default'
import { loginYConfigurarToken } from './helpers/loginAdmin'
import {
  asignarPacientes,
  getNutricionistasPorFiltro,
  getPacientesPorAsignar,
} from './helpers/obtener.usuarios'
import { UsuarioRolResponse } from '@/common/types/data-response.type'
import { log } from 'console'
import { loginYConfigurarTokenNutriologo } from './helpers/loginNutriologo'
import dayjs from 'dayjs'
import { generarCitas } from './helpers/citas'

async function main() {
  await AppDataSource.initialize()

  log('🔄 ====== OBTENIENDO EL TOKEN DEL USUARIO ADMINISTRADOR ======')

  await loginYConfigurarToken('ADMINISTRADOR', '123')
  log('✅ Token JWT configurado correctamente')
  log('🔄 ====== OBTENIENDO NUTRICIONISTAS POR FILTRO ======')
  const obtenerNutricionistas: UsuarioRolResponse[] =
    await getNutricionistasPorFiltro('1765251')

  const medico = obtenerNutricionistas[0]
  if (!medico) {
    console.error(
      '❌ No se encontró un nutricionista con el filtro proporcionado'
    )
    return
  }
  log('✅ Nutricionista obtenido:', medico)
  log('🔄 ====== OBTENIENDO PACIENTES POR ASIGNAR ======')

  const pacientesPorAsignar: UsuarioRolResponse[] =
    await getPacientesPorAsignar({
      limite: 20,
      idMedico: medico.id,
    })
  if (!pacientesPorAsignar || pacientesPorAsignar.length === 0) {
    console.error(
      '❌ No se encontraron pacientes por asignar para el nutricionista'
    )
    return
  }
  log('🔄 ===== ASIGNANDO PACIENTES ======')

  await asignarPacientes({
    idMedico: medico.id,
    idPacientes: pacientesPorAsignar.map((paciente) => paciente.id),
  })

  log('✅ Pacientes asignados correctamente:', pacientesPorAsignar.length)

  log('🔄 ====== OBTENIENDO TOKEN DE NUTRIOLOGO ======')
  await loginYConfigurarTokenNutriologo('NUTRICIONISTA', '123')
  log('✅ Token JWT de nutricionista configurado correctamente')

  log('🔄 ====== GENERANDO CITAS PARA PACIENTES ASIGNADOS ======')
  const citas = await generarCitas({
    fechaBase: dayjs().toString(),
    pacientes: pacientesPorAsignar,
  })
  if (!citas || citas.length === 0) {
    console.error('❌ No se generaron citas para los pacientes asignados')
    return
  }
  log('✅ Citas generadas correctamente:', citas.length)

  await AppDataSource.destroy()
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
