import { Module } from '@nestjs/common'
import { ConsultasRepository } from './repository/consultas.repository'
import { UsuariosRegistradosModule } from '../usuarios-registrado/usuarios-registrados.module'
import { ConsultasController } from './controller/consultas.controller'
import { ConsultasService } from './service/consultas.service'

@Module({
  controllers: [ConsultasController],
  providers: [ConsultasRepository, ConsultasService],
  imports: [UsuariosRegistradosModule],
})
export class ConsultasModule {}
