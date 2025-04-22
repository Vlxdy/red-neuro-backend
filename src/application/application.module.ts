import { Module } from '@nestjs/common'
import { ParametroModule } from './parametro/parametro.module'
import { UsuariosRegistradosModule } from './usuarios-registrado/usuarios-registrados.module'
import { AsignacionModule } from './asignacion/asignacion.module'
import { CitasModule } from './citas/citas.module'

@Module({
  imports: [
    ParametroModule,
    ApplicationModule,
    CitasModule,
    UsuariosRegistradosModule,
    AsignacionModule,
  ],
})
export class ApplicationModule {}
