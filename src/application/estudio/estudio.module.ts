import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Servicio } from './entities/estudio.entity'
import { ServicioEspecialidad } from './entities/estudio-especialidad.entity'
import { ServicioRepository } from './repository/estudio.repository'
import { ServicioService } from './services/estudio.service'
import { ServicioController } from './controllers/estudio.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Servicio, ServicioEspecialidad])],
  providers: [ServicioRepository, ServicioService],
  controllers: [ServicioController],
})
export class ServicioModule {}
