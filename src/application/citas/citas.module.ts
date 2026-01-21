import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CitasMedicasService } from './services/citas-medicas.service'
import { CitasController } from './controller/citas.controller'
import { HistorialCitasController } from './controller/historial-citas.controller'
import { CitasGateway } from './gateways/citas.gateway'
import { Cita } from './entities/cita.entity'
import { HistorialCita } from './entities/cita-historial.entity'
import { Notificacion } from './entities/notificacion.entity'
import { CitasMedicasRepository } from './repository/citas-medicas.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Cita, HistorialCita, Notificacion])],
  providers: [CitasMedicasRepository, CitasMedicasService, CitasGateway],
  controllers: [CitasController, HistorialCitasController],
})
export class CitasModule {}
