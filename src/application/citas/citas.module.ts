import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CitasMedicasService } from './services/citas-medicas.service'
import { CitasController } from './controller/citas.controller'
import { HomeCitasController } from './controller/home-citas.controller'
import { HistorialCitasController } from './controller/historial-citas.controller'
import { NotificacionesController } from './controller/notificaciones.controller'
import { DispositivosPushController } from './controller/dispositivos-push.controller'
import { PagosCitasController } from './controller/pagos-citas.controller'
import { ReportesCitasController } from './controller/reportes-citas.controller'
import { CajaCitasController } from './controller/caja-citas.controller'
import { CitasGateway } from './gateways/citas.gateway'
import { Cita } from './entities/cita.entity'
import { HistorialCita } from './entities/cita-historial.entity'
import { Notificacion } from './entities/notificacion.entity'
import { DispositivoPush } from './entities/dispositivo-push.entity'
import { CitasMedicasRepository } from './repository/citas-medicas.repository'
import { HistorialCitasRepository } from './repository/historial-citas.repository'
import { NotificacionesRepository } from './repository/notificaciones.repository'
import { DispositivosPushRepository } from './repository/dispositivos-push.repository'
import { HistorialCitasService } from './services/historial-citas.service'
import { NotificacionesService } from './services/notificaciones.service'
import { DispositivosPushService } from './services/dispositivos-push.service'
import { PushConfigService } from './services/push-config.service'
import { Servicio } from '@/application/servicio/entities/servicio.entity'
import { Lugar } from '@/application/lugar/entities/lugar.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { ExternalServicesModule } from '@/core/external-services/external.module'
import { CitaPago } from './entities/cita-pago.entity'
import { CajaSesion } from './entities/caja-sesion.entity'

@Module({
  imports: [
    ExternalServicesModule,
    TypeOrmModule.forFeature([
      Cita,
      HistorialCita,
      Notificacion,
      DispositivoPush,
      Servicio,
      Lugar,
      Usuario,
      CitaPago,
      CajaSesion,
    ]),
  ],
  providers: [
    CitasMedicasRepository,
    HistorialCitasRepository,
    NotificacionesRepository,
    DispositivosPushRepository,
    CitasMedicasService,
    HistorialCitasService,
    NotificacionesService,
    DispositivosPushService,
    PushConfigService,
    CitasGateway,
  ],
  exports: [CitasMedicasRepository],
  controllers: [
    CitasController,
    HomeCitasController,
    HistorialCitasController,
    NotificacionesController,
    DispositivosPushController,
    PagosCitasController,
    ReportesCitasController,
    CajaCitasController,
  ],
})
export class CitasModule {}
