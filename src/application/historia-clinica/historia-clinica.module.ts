import { forwardRef, Module } from '@nestjs/common'
import { ArchivoAdjuntoService } from './services/archivo-adjunto.service'
import { ArchivoRepository } from './repositories/archivo.repository'
import { GestionPacientesModule } from '../gestion-pacientes/gestion-pacientes.module'
import { EvaluacionesController } from './controllers/evaluacion-nutricional.controller'
import { EvaluacionNutricionalRepository } from './repositories/evaluacion-nutricional.repository'
import { EvaluacionNutricionalService } from './services/evaluacion-nutricional.service'
import { HistoriaClinicaService } from './services/historia-clinico.service'
import { HistoriaClinicaRepository } from './repositories/historia-clinica.repository'
import { HistoriaClinicaController } from './controllers/historia-clinica.controller'
import { ComentarioController } from './controllers/comentario.controller'
import { ComentarioRepository } from './repositories/comentario.repository'
import { ComentarioService } from './services/comentario.service'

@Module({
  imports: [forwardRef(() => GestionPacientesModule)],
  providers: [
    HistoriaClinicaService,
    HistoriaClinicaRepository,
    ArchivoAdjuntoService,
    ArchivoRepository,
    EvaluacionNutricionalRepository,
    EvaluacionNutricionalService,
    ComentarioRepository,
    ComentarioService,
  ],
  exports: [
    EvaluacionNutricionalService,
    HistoriaClinicaService,
    ArchivoAdjuntoService,
  ],
  controllers: [
    EvaluacionesController,
    HistoriaClinicaController,
    ComentarioController,
  ],
})
export class HistoriaClinicaModule {}
