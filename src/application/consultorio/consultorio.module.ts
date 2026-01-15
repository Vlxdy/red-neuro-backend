import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Consultorio } from './entities/consultorio.entity'
import { ConsultorioRepository } from './repository/consultorio.repository'
import { ConsultorioService } from './services/consultorio.service'
import { ConsultorioController } from './controllers/consultorio.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Consultorio])],
  providers: [ConsultorioRepository, ConsultorioService],
  controllers: [ConsultorioController],
})
export class ConsultorioModule {}
