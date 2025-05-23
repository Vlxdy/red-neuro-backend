import { forwardRef, Module } from '@nestjs/common'
import { PacientesController } from './controllers/pacientes.controller'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { MedicosService } from './services/medicos.service'
import { UsuariosRegistradosRepository } from './repositories/usuarios-registrados.repository'
import { PacientesService } from './services/pacientes.service'
import { AsignacionRepository } from './repositories/asignacion.repository'
import { AsignacionService } from './services/asignacion.service'
import { CitasRepository } from './repositories/citas.repository'
import { CitasService } from './services/citas.service'
import { MedicosController } from './controllers/medicos.controller'
import { AsignacionesController } from './controllers/asignacion.controller'
import { CitasController } from './controllers/citas.controller'
import { UsuariosRegistradosController } from './controllers/usuarios-registrados.controller'
import { UsuariosRegistradosService } from './services/usuarios-registrados.service'
import { HistoriaClinicaModule } from '../historia-clinica/historia-clinica.module'

@Module({
  imports: [forwardRef(() => HistoriaClinicaModule)],
  controllers: [
    PacientesController,
    MedicosController,
    AsignacionesController,
    CitasController,
    UsuariosRegistradosController,
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
  ],
  exports: [PacientesService, MedicosService],
})
export class GestionPacientesModule {}
