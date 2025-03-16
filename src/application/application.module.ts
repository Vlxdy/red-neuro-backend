import { Module } from '@nestjs/common'
import { ParametroModule } from './parametro/parametro.module'
import { ConsultasModule } from './consultas/consultas.module'
import { UsuariosRegistradosModule } from './usuarios-registrado/usuarios-registrados.module'
import { ControlModule } from './control/control.module'

@Module({
  imports: [
    ParametroModule,
    ApplicationModule,
    ConsultasModule,
    UsuariosRegistradosModule,
    ControlModule,
  ],
})
export class ApplicationModule {}
