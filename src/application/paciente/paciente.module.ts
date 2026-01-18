import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Paciente } from './entities/paciente.entity'
import { PacienteRepository } from './repository/paciente.repository'
import { PacienteService } from './services/paciente.service'
import { PacienteController } from './controllers/paciente.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Paciente])],
  providers: [PacienteRepository, PacienteService],
  controllers: [PacienteController],
})
export class PacienteModule {}
