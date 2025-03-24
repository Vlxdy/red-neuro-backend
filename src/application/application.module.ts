import { Module } from '@nestjs/common'
import { ParametroModule } from './parametro/parametro.module'
import { ConsultasModule } from './consultas/consultas.module'
import { UsuariosRegistradosModule } from './usuarios-registrado/usuarios-registrados.module'
import { AsignacionModule } from './asignacion/asignacion.module'

@Module({
  imports: [
    ParametroModule,
    ApplicationModule,
    ConsultasModule,
    UsuariosRegistradosModule,
    AsignacionModule,
  ],
})
export class ApplicationModule {}
