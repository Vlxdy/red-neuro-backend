import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CitasMedicasService } from './citas-medicas.service'
import { CitasController } from './controller/citas.controller'
import { EtiquetasController } from './controller/etiquetas.controller'
import { AgrupadoresController } from './controller/agrupadores.controller'
import { CitasGateway } from './gateways/citas.gateway'
import { Cita } from './entities/cita.entity'
import { HistorialCita } from './entities/cita-historial.entity'
import { Notificacion } from './entities/notificacion.entity'
import { Etiqueta } from './entities/etiqueta.entity'
import { Agrupador } from './entities/agrupador.entity'
import { CitaEtiqueta } from './entities/cita-etiqueta.entity'
import { CitasMedicasRepository } from './repository/citas-medicas.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cita,
      HistorialCita,
      Notificacion,
      Etiqueta,
      Agrupador,
      CitaEtiqueta,
    ]),
  ],
  providers: [CitasMedicasRepository, CitasMedicasService, CitasGateway],
  controllers: [CitasController, EtiquetasController, AgrupadoresController],
})
export class CitasMedicasModule {}
