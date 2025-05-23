import { Module } from '@nestjs/common'
import { ParametroModule } from './parametro/parametro.module'

import { GestionPacientesModule } from './gestion-pacientes/gestion-pacientes.module'
import { HistoriaClinicaModule } from './historia-clinica/historia-clinica.module'

@Module({
  imports: [ParametroModule, GestionPacientesModule, HistoriaClinicaModule],
})
export class ApplicationModule {}
