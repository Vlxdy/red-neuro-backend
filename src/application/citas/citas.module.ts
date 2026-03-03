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
import { HistorialCitasRepository } from './repository/historial-citas.repository'
import { HistorialCitasService } from './services/historial-citas.service'
import { Servicio } from '@/application/servicio/entities/servicio.entity'
import { Lugar } from '@/application/lugar/entities/lugar.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cita,
      HistorialCita,
      Notificacion,
      Servicio,
      Lugar,
    ]),
  ],
  providers: [
    CitasMedicasRepository,
    HistorialCitasRepository,
    CitasMedicasService,
    HistorialCitasService,
    CitasGateway,
  ],
  controllers: [CitasController, HistorialCitasController],
})
export class CitasModule {}
