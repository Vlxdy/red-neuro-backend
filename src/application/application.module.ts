import { Module } from '@nestjs/common'
import { ParametroModule } from './parametro/parametro.module'

import { GestionPacientesModule } from './gestion-pacientes/gestion-pacientes.module'

@Module({
  imports: [ParametroModule, ApplicationModule, GestionPacientesModule],
})
export class ApplicationModule {}
