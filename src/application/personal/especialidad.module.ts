import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Especialidad } from './entities/especialidad.entity'
import { EspecialidadRepository } from './repository/especialidad.repository'
import { EspecialidadService } from './services/especialidad.service'
import { EspecialidadController } from './controllers/especialidad.controller'
import { PersonalSaludController } from './controllers/personal-salud.controller'
import { PersonalSaludRepository } from './repository/personal-salud.repository'
import { PersonalSaludService } from './services/personal-salud.service'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { Persona } from '@/core/usuario/entity/persona.entity'
import { UsuarioRolEspecialidad } from './entities/usuaro-rol-especialidad.entity'
import { UsuarioModule } from '@/core/usuario/usuario.module'
import { Servicio } from '@/application/servicio/entities/servicio.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Especialidad,
      Servicio,
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
    PersonalSaludRepository,
    PersonalSaludService,
  ],
  controllers: [EspecialidadController, PersonalSaludController],
})
export class EspecialidadModule {}
