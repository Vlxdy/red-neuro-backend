import { Module } from '@nestjs/common'
import { MensajeriaModule } from './mensajeria/mensajeria.module'

@Module({
  imports: [MensajeriaModule],
  providers: [],
  exports: [MensajeriaModule],
})
export class ExternalServicesModule {}
