import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ParametroModule } from './parametro/parametro.module'
import { PrinterModule } from '@/printer/printer.module'
import { HistoriaClinicaService } from './historia-clinica/services/historia-clinico.service'
import { HistoriaClinicaRepository } from './historia-clinica/repositories/historia-clinica.repository'
import { ArchivoAdjuntoService } from './historia-clinica/services/archivo-adjunto.service'
import { ArchivoRepository } from './historia-clinica/repositories/archivo.repository'
import { ComentarioRepository } from './historia-clinica/repositories/comentario.repository'
import { ComentarioService } from './historia-clinica/services/comentario.service'
import { AntecedenteRepository } from './historia-clinica/repositories/antecedentes.repository'
import { AntecedenteService } from './historia-clinica/services/antecedentes.service'
import { PacientesService } from './gestion-pacientes/services/pacientes.service'
import { MedicosService } from './gestion-pacientes/services/medicos.service'
import { UsuariosRegistradosRepository } from './gestion-pacientes/repositories/usuarios-registrados.repository'
import { UsuariosRegistradosService } from './gestion-pacientes/services/usuarios-registrados.service'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { AsignacionRepository } from './gestion-pacientes/repositories/asignacion.repository'
import { AsignacionService } from './gestion-pacientes/services/asignacion.service'
import { CitasRepository } from './gestion-pacientes/repositories/citas.repository'
import { HistorialCitaRepository } from './gestion-pacientes/repositories/historial-cita.repository'
import { CitasService } from './gestion-pacientes/services/citas.service'
import { PlanNutricionalService } from './planes-alimentarios/service/plan-nutricional.service'
import { PlanNutricionalRepository } from './planes-alimentarios/repository/plan-nutricional.repository'
import { AlimentoPlanNutricionalRepository } from './planes-alimentarios/repository/alimento-plan-nutricional.repository'
import { PlanNutricionalSeguimientoRepository } from './planes-alimentarios/repository/plan-nutricional-seguimiento.repository'
import { CarritoCompraService } from './planes-alimentarios/service/carrito-compra.service'
import { CarritoCompraRepository } from './planes-alimentarios/repository/carrito-compra.repository'
import { AlimentoService } from './planes-alimentarios/service/alimento.service'
import { AlimentoRepository } from './planes-alimentarios/repository/alimento.repository'
import { PrinterService } from '@/printer/printer.service'
import { NotificacionRepository } from './gestion-pacientes/repositories/notificacion.repository'
import { NotificacionService } from './gestion-pacientes/services/notificacion.service'
import { EvaluacionNutricionalService } from './evaluaciones/services/evaluacion-nutricional.service'
import { UsuarioRepository } from '@/core/usuario/repository/usuario.repository'
import { PersonaRepository } from '@/core/usuario/repository/persona.repository'
import { EvaluacionesController } from './evaluaciones/controllers/evaluacion-nutricional.controller'
import { HistoriaClinicaController } from './historia-clinica/controllers/historia-clinica.controller'
import { HistoriaClinica } from './historia-clinica/entities/historia-clinica.entity'
import { ComentarioController } from './historia-clinica/controllers/comentario.controller'
import { PacientesController } from './gestion-pacientes/controllers/pacientes.controller'
import { MedicosController } from './gestion-pacientes/controllers/medicos.controller'
import { AsignacionesController } from './gestion-pacientes/controllers/asignacion.controller'
import { CitasController } from './gestion-pacientes/controllers/citas.controller'
import { UsuariosRegistradosController } from './gestion-pacientes/controllers/usuarios-registrados.controller'
import { PlanNutricionalController } from './planes-alimentarios/controller/plan-nutricional.controller'
import { CarritoCompraController } from './planes-alimentarios/controller/carrito-compras.controller'
import { AlimentoController } from './planes-alimentarios/controller/alimento.controller'
import { NotificacionController } from './gestion-pacientes/controllers/notificaciones.controller'
import { AntecedentesController } from './historia-clinica/controllers/antecedentes.controller'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ComentarioGateway } from './historia-clinica/gateways/comentario.gateway'
import { ComentarioArchivosService } from './historia-clinica/services/comentario-archivos.service'
import { EvaluacionNutricional } from './evaluaciones/entities/evaluacion-nutricional.entity'
import { EvaluacionAntropometrica } from './evaluaciones/entities/eval-antropometrica.entity'
import { EvaluacionBioquimica } from './evaluaciones/entities/eval-bioquimica.entity'
import { EvaluacionDietetica } from './evaluaciones/entities/eval-dietetica.entity'
import { EvaluacionClinica } from './evaluaciones/entities/eval-clinica.entity'
import { EvaluacionPsicosocial } from './evaluaciones/entities/eval-psicosocial.entity'
import { EvaluacionArchivosService } from './evaluaciones/services/evaluacion-archivos.service'

@Module({
  imports: [
    ParametroModule,
    PrinterModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      verifyOptions: {
        ignoreExpiration: false,
      },
    }),
    TypeOrmModule.forFeature([
      EvaluacionNutricional,
      EvaluacionAntropometrica,
      EvaluacionBioquimica,
      EvaluacionDietetica,
      EvaluacionClinica,
      EvaluacionPsicosocial,
      HistoriaClinica,
    ]),
  ],
  providers: [
    ConfigService,
    HistoriaClinicaService,
    HistoriaClinicaRepository,
    ArchivoAdjuntoService,
    ArchivoRepository,
    ComentarioRepository,
    ComentarioService,
    ComentarioGateway,
    ComentarioArchivosService,
    AntecedenteRepository,
    AntecedenteService,
    PacientesService,
    MedicosService,
    UsuariosRegistradosRepository,
    UsuariosRegistradosService,
    UsuarioRolRepository,
    UsuarioRepository,
    PersonaRepository,
    AsignacionRepository,
    AsignacionService,
    CitasRepository,
    HistorialCitaRepository,
    CitasService,
    PlanNutricionalService,
    PlanNutricionalRepository,
    PlanNutricionalSeguimientoRepository,
    AlimentoPlanNutricionalRepository,
    CarritoCompraService,
    CarritoCompraRepository,
    AlimentoService,
    AlimentoRepository,
    PrinterService,
    NotificacionRepository,
    NotificacionService,
    EvaluacionNutricionalService,
    EvaluacionArchivosService,
  ],
  controllers: [
    EvaluacionesController,
    HistoriaClinicaController,
    AntecedentesController,
    ComentarioController,
    PacientesController,
    MedicosController,
    AsignacionesController,
    CitasController,
    UsuariosRegistradosController,
    PlanNutricionalController,
    CarritoCompraController,
    AlimentoController,
    NotificacionController,
  ],
  exports: [HistoriaClinicaService],
})
export class ApplicationModule {}
