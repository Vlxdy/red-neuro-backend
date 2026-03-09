import { Module } from '@nestjs/common'
import { MensajeriaModule } from './mensajeria/mensajeria.module'
import { PushModule } from './push/push.module'
import { FirebaseModule } from './firebase/firebase.module'

@Module({
  imports: [MensajeriaModule, FirebaseModule, PushModule],
  providers: [],
  exports: [MensajeriaModule, FirebaseModule, PushModule],
})
export class ExternalServicesModule {}
