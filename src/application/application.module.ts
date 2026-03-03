import { Module } from '@nestjs/common'
import { PrinterModule } from '@/printer/printer.module'
import { ConfigService } from '@nestjs/config'
import { ConsultorioModule } from './consultorio/consultorio.module'
import { CitasModule } from './citas/citas.module'
import { ServicioModule } from './servicio/servicio.module'
import { EspecialidadModule } from './personal/especialidad.module'
import { PacienteModule } from './paciente/paciente.module'
import { LugarModule } from './lugar/lugar.module'

@Module({
  imports: [
    PrinterModule,
    CitasModule,
    ConsultorioModule,
    ServicioModule,
    EspecialidadModule,
    PacienteModule,
    LugarModule,
  ],
  providers: [ConfigService],
})
export class ApplicationModule {}
