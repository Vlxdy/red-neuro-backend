import { Module } from '@nestjs/common'
import { UsuariosRegistradosModule } from '../usuarios-registrado/usuarios-registrados.module'
import { CitasController } from './controller/citas.controller'
import { CitasRepository } from './repository/citas.repository'
import { CitasService } from './service/citas.service'
import { EvaluacionNutricional } from './entity/evaluacion.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EvaluacionService } from './service/evaluacion.service'
import { EvaluacionRepository } from './repository/evaluacion.repository'
import { EvaluacionController } from './controller/evaluacion.controller'
import { Cita } from './entity/cita.entity'

@Module({
  controllers: [CitasController, EvaluacionController],
  providers: [
    CitasRepository,
    CitasService,
    EvaluacionRepository,
    EvaluacionService,
  ],
  imports: [
    UsuariosRegistradosModule,
    TypeOrmModule.forFeature([EvaluacionNutricional, Cita]),
  ],
})
export class CitasModule {}
