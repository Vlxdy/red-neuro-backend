import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PersonalSaludController } from './controllers/personal-salud.controller'
import { PersonalSaludRepository } from './repository/personal-salud.repository'
import { PersonalSaludService } from './services/personal-salud.service'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { Persona } from '@/core/usuario/entity/persona.entity'
import { UsuarioModule } from '@/core/usuario/usuario.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioRol, Usuario, Persona]),
    UsuarioModule,
  ],
  providers: [PersonalSaludRepository, PersonalSaludService],
  controllers: [PersonalSaludController],
})
export class PersonalModule {}
