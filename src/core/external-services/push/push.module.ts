import { Module } from '@nestjs/common'
import { FirebaseModule } from '../firebase/firebase.module'
import { FirebasePushService } from './push.service'

@Module({
  imports: [FirebaseModule],
  providers: [FirebasePushService],
  exports: [FirebasePushService],
})
export class PushModule {}
