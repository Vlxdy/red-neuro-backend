import { Module } from '@nestjs/common'
import { MensajeriaService } from './mensajeria.service'
import { ConfigModule } from '@nestjs/config'
import { mensajeriaConfig } from './mensajeria.config'

@Module({
  imports: [ConfigModule.forFeature(mensajeriaConfig)],
  providers: [MensajeriaService],
  exports: [MensajeriaService],
})
export class MensajeriaModule {}
