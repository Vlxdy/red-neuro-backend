import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthorizationController } from './controller/authorization.controller'
import { AuthorizationService } from './controller/authorization.service'
import { ModuloController } from './controller/modulo.controller'
import { RolController } from './controller/rol.controller'
import { ModuloService } from './service/modulo.service'
import { RolService } from './service/rol.service'
import { UsuarioRolRepository } from './repository/usuario-rol.repository'
import { RolRepository } from './repository/rol.repository'
import { ModuloRepository } from './repository/modulo.repository'
import { UsuarioRepository } from '../usuario/repository/usuario.repository'
import { UsuarioRol } from './entity/usuario-rol.entity'
import { Rol } from './entity/rol.entity'
import { Modulo } from './entity/modulo.entity'
import { Usuario } from '../usuario/entity/usuario.entity'
@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioRol, Rol, Modulo, Usuario]),
    ConfigModule,
  ],
  exports: [AuthorizationService],
  controllers: [AuthorizationController, RolController, ModuloController],
  providers: [
    RolService,
    ModuloService,
    ConfigService,
    AuthorizationService,
    UsuarioRolRepository,
    RolRepository,
    ModuloRepository,
    UsuarioRepository,
  ],
})
export class AuthorizationModule {}
