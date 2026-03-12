import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Ocupacion } from './entities/ocupacion.entity'
import { OcupacionRepository } from './repository/ocupacion.repository'
import { OcupacionService } from './services/ocupacion.service'
import { OcupacionController } from './controllers/ocupacion.controller'
import { PersonalSaludController } from './controllers/personal-salud.controller'
import { PersonalSaludRepository } from './repository/personal-salud.repository'
import { PersonalSaludService } from './services/personal-salud.service'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { Persona } from '@/core/usuario/entity/persona.entity'
import { UsuarioRolOcupacion } from './entities/usuaro-rol-ocupacion.entity'
import { UsuarioModule } from '@/core/usuario/usuario.module'
import { Servicio } from '@/application/servicio/entities/servicio.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ocupacion,
      Servicio,
      UsuarioRol,
      Usuario,
      Persona,
      UsuarioRolOcupacion,
    ]),
    UsuarioModule,
  ],
  providers: [
    OcupacionRepository,
    OcupacionService,
    PersonalSaludRepository,
    PersonalSaludService,
  ],
  controllers: [OcupacionController, PersonalSaludController],
})
export class PersonalModule {}
