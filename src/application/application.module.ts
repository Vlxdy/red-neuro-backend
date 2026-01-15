import { Module } from '@nestjs/common'
import { PrinterModule } from '@/printer/printer.module'
import { ConfigService } from '@nestjs/config'
import { ConsultorioModule } from './consultorio/consultorio.module'
import { CitasModule } from './citas/citas.module'

@Module({
  imports: [PrinterModule, CitasModule, ConsultorioModule],
  providers: [ConfigService],
})
export class ApplicationModule {}
