import { Module } from '@nestjs/common'
import { ParametroModule } from './parametro/parametro.module'
import { AsignacionesModule } from './asignaciones/asignaciones.module'

@Module({
  imports: [ParametroModule, ApplicationModule, AsignacionesModule],
})
export class ApplicationModule {}
