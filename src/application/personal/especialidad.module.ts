import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Especialidad } from './entities/especialidad.entity'
import { EstudioEspecialidad } from '@/application/estudio/entities/estudio-especialidad.entity'
import { EspecialidadRepository } from './repository/especialidad.repository'
import { EspecialidadService } from './services/especialidad.service'
import { EspecialidadController } from './controllers/especialidad.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Especialidad, EstudioEspecialidad])],
  providers: [EspecialidadRepository, EspecialidadService],
  controllers: [EspecialidadController],
})
export class EspecialidadModule {}
