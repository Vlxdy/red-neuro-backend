import { Module } from '@nestjs/common'
// import { ParametroController } from '@/application/parametro/controller/parametro.controller'
// import { ParametroService } from '@/application/parametro/service/parametro.service'
// import { ParametroRepository } from '@/application/parametro/repository/parametro.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Asignacion } from './entity/asignacion.entity'
import { AsignacionesController } from './controller/asignaciones.controller'
import { AsignacionesRepository } from './repository/asignaciones.repository'
import { AsignacionesService } from './service/asignaciones.service'
import { MedicoPacienteService } from './service/medico.paciente.service'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'

@Module({
  controllers: [AsignacionesController],
  providers: [
    AsignacionesRepository,
    AsignacionesService,
    MedicoPacienteService,
    UsuarioRolRepository,
  ],
  imports: [TypeOrmModule.forFeature([Asignacion])],
})
export class AsignacionesModule {}
