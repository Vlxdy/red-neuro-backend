import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getMessaging, Messaging } from 'firebase-admin/messaging'
import { FIREBASE_APP, FIREBASE_MESSAGING } from './firebase.constants'
import { FirebasePushService } from './firebase-push.service'
import * as fs from 'node:fs'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FIREBASE_APP,
      useFactory: (): App => {
        const apps = getApps()
        if (apps.length > 0) {
          return getApp()
        }

        const filePath = process.env.FCM_CREDENTIALS_FILE
        if (!filePath) {
          throw new Error('FCM_CREDENTIALS_FILE no está configurado')
        }

        if (!fs.existsSync(filePath)) {
          throw new Error(`No existe el archivo de credenciales en ${filePath}`)
        }

        const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        return initializeApp({
          credential: cert(serviceAccount),
        })
      },
    },
    {
      provide: FIREBASE_MESSAGING,
      inject: [FIREBASE_APP],
      useFactory: (app: App): Messaging => getMessaging(app),
    },
    FirebasePushService,
  ],
  exports: [FIREBASE_APP, FIREBASE_MESSAGING, FirebasePushService],
})
export class FirebaseModule {}
