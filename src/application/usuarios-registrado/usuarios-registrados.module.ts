import { Module } from '@nestjs/common'
import { UsuariosRegistradosService } from './service/usuarios-registrados.service'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { UsuariosRegistradosController } from './controllers/usuario-registrados.controller'
import { UsuariosRegistradosRepository } from './repository/usuarios-registrados.repository'

@Module({
  controllers: [UsuariosRegistradosController],
  providers: [
    UsuariosRegistradosService,
    UsuariosRegistradosRepository,
    UsuarioRolRepository,
  ],
  exports: [UsuariosRegistradosService],
})
export class UsuariosRegistradosModule {}
