import { Module } from '@nestjs/common'
import { UsuariosRegistradosModule } from '../usuarios-registrado/usuarios-registrados.module'
import { SeguimientoController } from './controller/seguimiento.controller'
import { SeguimientoService } from './service/seguimiento.service'
import { SeguimientoRepository } from './repository/seguimiento.repository'

@Module({
  controllers: [SeguimientoController],
  providers: [SeguimientoService, SeguimientoRepository],
  imports: [UsuariosRegistradosModule],
})
export class SeguimientoModule {}
