import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Especialidad } from './entities/especialidad.entity'
import { EstudioEspecialidad } from '@/application/estudio/entities/estudio-especialidad.entity'
import { EspecialidadRepository } from './repository/especialidad.repository'
import { EspecialidadService } from './services/especialidad.service'
import { EspecialidadController } from './controllers/especialidad.controller'
import { PersonalMedicoController } from './controllers/personal-medico.controller'
import { PersonalMedicoRepository } from './repository/personal-medico.repository'
import { PersonalMedicoService } from './services/personal-medico.service'
import { PersonalSaludController } from './controllers/personal-salud.controller'
import { PersonalSaludRepository } from './repository/personal-salud.repository'
import { PersonalSaludService } from './services/personal-salud.service'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { Persona } from '@/core/usuario/entity/persona.entity'
import { UsuarioRolEspecialidad } from './entities/usuaro-rol-especialidad.entity'
import { UsuarioModule } from '@/core/usuario/usuario.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Especialidad,
      EstudioEspecialidad,
      UsuarioRol,
      Usuario,
      Persona,
      UsuarioRolEspecialidad,
    ]),
    UsuarioModule,
  ],
  providers: [
    EspecialidadRepository,
    EspecialidadService,
    PersonalMedicoRepository,
    PersonalMedicoService,
    PersonalSaludRepository,
    PersonalSaludService,
  ],
  controllers: [
    EspecialidadController,
    PersonalMedicoController,
    PersonalSaludController,
  ],
})
export class EspecialidadModule {}
