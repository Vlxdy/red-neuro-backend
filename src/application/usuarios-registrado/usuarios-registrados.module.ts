import { Module } from '@nestjs/common'
import { UsuariosRegistradosService } from './service/usuarios-registrados.service'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'

@Module({
  providers: [UsuariosRegistradosService, UsuarioRolRepository],
  exports: [UsuariosRegistradosService],
})
export class UsuariosRegistradosModule {}
