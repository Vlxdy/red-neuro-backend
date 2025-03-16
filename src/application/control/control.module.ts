import { Module } from '@nestjs/common'
import { UsuariosRegistradosModule } from '../usuarios-registrado/usuarios-registrados.module'
import { ControlController } from './controller/control.controller'
import { ControlService } from './service/control.service'
import { ControlRepository } from './repository/control.repository'

@Module({
  controllers: [ControlController],
  providers: [ControlService, ControlRepository],
  imports: [UsuariosRegistradosModule],
})
export class ControlModule {}
