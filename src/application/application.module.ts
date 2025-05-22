import { Module } from '@nestjs/common'
import { ParametroModule } from './parametro/parametro.module'

import { GestionPacientesModule } from './gestion-pacientes/gestion-pacientes.module'
import { HistorialMedicoModule } from './historia-clinica/historial-medico.module'

@Module({
  imports: [ParametroModule, GestionPacientesModule, HistorialMedicoModule],
})
export class ApplicationModule {}
