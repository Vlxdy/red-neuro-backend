import { forwardRef, Module } from '@nestjs/common'
import { HistorialMedicoService } from './services/historial-medico.service'
import { HistorialMedicoRepository } from './repositories/historial-medico.repository'
import { ExamenSolicitadoService } from './services/examen-solicitado.service'
import { ExamenSolicitadoRepository } from './repositories/examen-solicitado.repository'
import { ArchivoAdjuntoService } from './services/archivo-adjunto.service'
import { ArchivoRepository } from './repositories/archivo.repository'
import { GestionPacientesModule } from '../gestion-pacientes/gestion-pacientes.module'
import { EvaluacionesController } from './controllers/evaluacion-nutricional.controller'
import { EvaluacionNutricionalRepository } from './entities/evaluacion-nutricional.repository'
import { EvaluacionNutricionalService } from './services/evaluacion-nutricional.service'

@Module({
  imports: [forwardRef(() => GestionPacientesModule)],
  providers: [
    HistorialMedicoService,
    HistorialMedicoRepository,
    ExamenSolicitadoService,
    ExamenSolicitadoRepository,
    ArchivoAdjuntoService,
    ArchivoRepository,
    EvaluacionNutricionalRepository,
    EvaluacionNutricionalService,
  ],
  exports: [
    EvaluacionNutricionalService,
    HistorialMedicoService,
    ExamenSolicitadoService,
    ArchivoAdjuntoService,
  ],
  controllers: [EvaluacionesController],
})
export class HistorialMedicoModule {}
