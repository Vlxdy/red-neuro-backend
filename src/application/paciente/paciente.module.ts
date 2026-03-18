import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Paciente } from './entities/paciente.entity'
import { PacienteRepository } from './repository/paciente.repository'
import { PacienteService } from './services/paciente.service'
import { PacienteController } from './controllers/paciente.controller'
import { PacienteProfesionalInvitado } from './entities/paciente-profesional-invitado.entity'
import { PacienteProfesionalInvitadoRepository } from './repository/paciente-profesional-invitado.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Paciente, PacienteProfesionalInvitado])],
  providers: [
    PacienteRepository,
    PacienteProfesionalInvitadoRepository,
    PacienteService,
  ],
  controllers: [PacienteController],
  exports: [PacienteProfesionalInvitadoRepository],
})
export class PacienteModule {}
