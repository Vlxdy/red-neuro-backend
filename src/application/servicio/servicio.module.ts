import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Servicio } from './entities/servicio.entity'
import { ServicioEspecialidad } from './entities/servicio-especialidad.entity'
import { ServicioRepository } from './repository/servicio.repository'
import { ServicioService } from './services/servicio.service'
import { ServicioController } from './controllers/servicio.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Servicio, ServicioEspecialidad])],
  providers: [ServicioRepository, ServicioService],
  controllers: [ServicioController],
})
export class ServicioModule {}
