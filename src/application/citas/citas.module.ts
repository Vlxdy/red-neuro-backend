import { Module } from '@nestjs/common'
import { UsuariosRegistradosModule } from '../usuarios-registrado/usuarios-registrados.module'
import { CitasController } from './controller/citas.controller'
import { CitasRepository } from './repository/citas.repository'
import { CitasService } from './service/citas.service'

@Module({
  controllers: [CitasController],
  providers: [CitasRepository, CitasService],
  imports: [UsuariosRegistradosModule],
})
export class CitasModule {}
