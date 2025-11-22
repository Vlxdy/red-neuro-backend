import { Module } from '@nestjs/common'
import { PrinterModule } from '@/printer/printer.module'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [PrinterModule],
  providers: [ConfigService],
})
export class ApplicationModule {}
