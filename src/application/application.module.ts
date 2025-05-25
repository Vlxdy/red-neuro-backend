import { Module } from '@nestjs/common'
import { ParametroModule } from './parametro/parametro.module'

import { GestionPacientesModule } from './gestion-pacientes/gestion-pacientes.module'
import { HistoriaClinicaModule } from './historia-clinica/historia-clinica.module'
import { PrinterModule } from '@/printer/printer.module'

@Module({
  imports: [
    ParametroModule,
    GestionPacientesModule,
    HistoriaClinicaModule,
    PrinterModule,
  ],
})
export class ApplicationModule {}
