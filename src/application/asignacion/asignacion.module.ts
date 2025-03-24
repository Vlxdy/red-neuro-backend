import { Module } from '@nestjs/common'
import { UsuariosRegistradosModule } from '../usuarios-registrado/usuarios-registrados.module'
import { AsignacionRepository } from './repository/asignacion.repository'
import { AsignacionService } from './service/asignacion.service'
import { Asignacion } from './entity/asignados.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AsignacionController } from './controller/asignacion.controller'

@Module({
  controllers: [AsignacionController],
  providers: [AsignacionService, AsignacionRepository],
  imports: [UsuariosRegistradosModule, TypeOrmModule.forFeature([Asignacion])],
})
export class AsignacionModule {}
