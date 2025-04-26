import { Module } from '@nestjs/common'
import { PacientesController } from './controllers/pacientes.controller'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { MedicosService } from './services/medicos.service'
import { UsuariosRegistradosRepository } from './repositories/usuarios-registrados.repository'
import { PacientesService } from './services/pacientes.service'
import { AsignacionRepository } from './repositories/asignacion.repository'
import { AsignacionService } from './services/asignacion.service'
import { CitasRepository } from './entities/citas.repository'
import { CitasService } from './services/citas.service'
import { EvaluacionService } from './services/evaluacion.service'
import { EvaluacionRepository } from './entities/evaluacion.repository'
import { MedicosController } from './controllers/medicos.controller'
import { AsignacionesController } from './controllers/asignacion.controller'
import { CitasController } from './controllers/citas.controller'
import { UsuariosRegistradosController } from './controllers/usuarios-registrados.controller'
import { EvaluacionesController } from './controllers/evaluacion.controller'
import { UsuariosRegistradosService } from './services/usuarios-registrados.service'

@Module({
  controllers: [
    PacientesController,
    MedicosController,
    AsignacionesController,
    CitasController,
    UsuariosRegistradosController,
    EvaluacionesController,
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
    EvaluacionService,
    EvaluacionRepository,
  ],
  exports: [PacientesService, MedicosService],
})
export class GestionPacientesModule {}
