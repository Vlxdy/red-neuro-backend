import { Module } from '@nestjs/common'
import { UsuariosRegistradosService } from './service/usuarios-registrados.service'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { UsuariosRegistradosController } from './controllers/usuario-registrados.controller'

@Module({
  controllers: [UsuariosRegistradosController],
  providers: [UsuariosRegistradosService, UsuarioRolRepository],
  exports: [UsuariosRegistradosService],
})
export class UsuariosRegistradosModule {}
