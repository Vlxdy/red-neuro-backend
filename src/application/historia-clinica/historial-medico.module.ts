import { forwardRef, Module } from '@nestjs/common'
import { HistorialMedicoService } from './services/historial-medico.service'
import { HistorialMedicoRepository } from './repositories/historial-medico.repository'
import { ArchivoAdjuntoService } from './services/archivo-adjunto.service'
import { ArchivoRepository } from './repositories/archivo.repository'
import { GestionPacientesModule } from '../gestion-pacientes/gestion-pacientes.module'
import { EvaluacionesController } from './controllers/evaluacion-nutricional.controller'
import { EvaluacionNutricionalRepository } from './repositories/evaluacion-nutricional.repository'
import { EvaluacionNutricionalService } from './services/evaluacion-nutricional.service'

@Module({
  imports: [forwardRef(() => GestionPacientesModule)],
  providers: [
    HistorialMedicoService,
    HistorialMedicoRepository,
    ArchivoAdjuntoService,
    ArchivoRepository,
    EvaluacionNutricionalRepository,
    EvaluacionNutricionalService,
  ],
  exports: [
    EvaluacionNutricionalService,
    HistorialMedicoService,
    ArchivoAdjuntoService,
  ],
  controllers: [EvaluacionesController],
})
export class HistorialMedicoModule {}
