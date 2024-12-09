import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsuarioService } from './service/usuario.service'
import { UsuarioController } from './controller/usuario.controller'
import { MensajeriaModule } from '../external-services/mensajeria/mensajeria.module'
import { ConfigModule } from '@nestjs/config'
import { AuthorizationModule } from '../authorization/authorization.module'
import { IopModule } from '../external-services/iop/iop.module'
import { RolRepository } from '../authorization/repository/rol.repository'
import { UsuarioRepository } from './repository/usuario.repository'
import { PersonaRepository } from './repository/persona.repository'
import { UsuarioRolRepository } from '../authorization/repository/usuario-rol.repository'
import { Usuario } from './entity/usuario.entity'
import { Persona } from './entity/persona.entity'
import { UsuarioRol } from '../authorization/entity/usuario-rol.entity'
import { Rol } from '../authorization/entity/rol.entity'
import { FileValidationService } from '@/common/lib/file-validation.service'

@Module({
  providers: [
    UsuarioService,
    UsuarioRepository,
    PersonaRepository,
    UsuarioRolRepository,
    RolRepository,
    FileValidationService,
  ],
  exports: [UsuarioService],
  imports: [
    TypeOrmModule.forFeature([Usuario, Persona, UsuarioRol, Rol]),
    MensajeriaModule,
    IopModule,
    ConfigModule,
    AuthorizationModule,
  ],
  controllers: [UsuarioController],
})
export class UsuarioModule {}
