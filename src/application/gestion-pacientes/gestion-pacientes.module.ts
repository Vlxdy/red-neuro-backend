import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { forwardRef, Module } from '@nestjs/common'
import { HistoriaClinicaModule } from '../historia-clinica/historia-clinica.module'
import { AlimentoController } from '../planes-alimentarios/controller/alimento.controller'
import { PlanNutricionalController } from '../planes-alimentarios/controller/plan-nutricional.controller'
import { AlimentoRepository } from '../planes-alimentarios/repository/alimento.repository'
import { PlanNutricionalRepository } from '../planes-alimentarios/repository/plan-nutricional.repository'
import { AlimentoService } from '../planes-alimentarios/service/alimento.service'
import { PlanNutricionalService } from '../planes-alimentarios/service/plan-nutricional.service'
import { AsignacionesController } from './controllers/asignacion.controller'
import { CitasController } from './controllers/citas.controller'
import { MedicosController } from './controllers/medicos.controller'
import { PacientesController } from './controllers/pacientes.controller'
import { UsuariosRegistradosController } from './controllers/usuarios-registrados.controller'
import { AsignacionRepository } from './repositories/asignacion.repository'
import { CitasRepository } from './repositories/citas.repository'
import { UsuariosRegistradosRepository } from './repositories/usuarios-registrados.repository'
import { AsignacionService } from './services/asignacion.service'
import { CitasService } from './services/citas.service'
import { MedicosService } from './services/medicos.service'
import { PacientesService } from './services/pacientes.service'
import { UsuariosRegistradosService } from './services/usuarios-registrados.service'
import { PrinterService } from '@/printer/printer.service'

@Module({
  imports: [forwardRef(() => HistoriaClinicaModule)],
  controllers: [
    PacientesController,
    MedicosController,
    AsignacionesController,
    CitasController,
    UsuariosRegistradosController,
    PlanNutricionalController,
    AlimentoController,
  ],
  providers: [
    PacientesService,
    MedicosService,
    UsuariosRegistradosRepository,
    UsuariosRegistradosService,
    UsuarioRolRepository,
    AsignacionRepository,
    AsignacionService,
    CitasRepository,
    CitasService,
    PlanNutricionalService,
    PlanNutricionalRepository,
    AlimentoService,
    AlimentoRepository,
    PrinterService,
  ],
  exports: [PacientesService, MedicosService, CitasService],
})
export class GestionPacientesModule {}
