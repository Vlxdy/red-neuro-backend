import { Module } from '@nestjs/common'
import { PrinterModule } from '@/printer/printer.module'
import { ConfigService } from '@nestjs/config'
import { ConsultorioModule } from './consultorio/consultorio.module'
import { CitasModule } from './citas/citas.module'
import { EstudioModule } from './estudio/estudio.module'
import { EspecialidadModule } from './personal/especialidad.module'

@Module({
  imports: [
    PrinterModule,
    CitasModule,
    ConsultorioModule,
    EstudioModule,
    EspecialidadModule,
  ],
  providers: [ConfigService],
})
export class ApplicationModule {}
