import { Module } from '@nestjs/common'
import { PrinterModule } from '@/printer/printer.module'
import { ConfigService } from '@nestjs/config'
import { CitasMedicasModule } from './citas-medicas/citas-medicas.module'

@Module({
  imports: [PrinterModule, CitasMedicasModule],
  providers: [ConfigService],
})
export class ApplicationModule {}
