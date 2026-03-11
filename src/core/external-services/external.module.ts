import { Module } from '@nestjs/common'
import { MensajeriaModule } from './mensajeria/mensajeria.module'
import { FirebaseModule } from './firebase/firebase.module'

@Module({
  imports: [MensajeriaModule, FirebaseModule],
  providers: [],
  exports: [MensajeriaModule, FirebaseModule],
})
export class ExternalServicesModule {}
