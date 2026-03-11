import { Injectable } from '@nestjs/common'
import { BaseService } from '@/common/base'
import { FirebaseService } from '../firebase/firebase.service'

@Injectable()
export class FirebasePushService extends BaseService {
  constructor(private readonly firebaseService: FirebaseService) {
    super()
  }

  private getMessagingModule() {
    // Uso directo de la librería oficial firebase-admin
    return require('firebase-admin/messaging') as {
      getMessaging: (app?: unknown) => {
        sendEachForMulticast: (message: {
          notification?: { title?: string; body?: string }
          data?: Record<string, string>
          tokens: string[]
        }) => Promise<{ successCount: number; failureCount: number }>
      }
    }
  }

  async enviarPushMasivo(payload: {
    tokens: string[]
    title: string
    body: string
    data?: Record<string, string>
  }): Promise<{ enviados: number; fallidos: number }> {
    if (!payload.tokens.length) {
      return { enviados: 0, fallidos: 0 }
    }

    const app = this.firebaseService.obtenerApp()
    const messaging = this.getMessagingModule().getMessaging(app)

    const resultado = await messaging.sendEachForMulticast({
      notification: { title: payload.title, body: payload.body },
      data: payload.data,
      tokens: payload.tokens,
    })

    if (resultado.failureCount > 0) {
      this.logger.warn(
        `Push con fallos parciales: ${resultado.failureCount} de ${payload.tokens.length}`
      )
    }

    return {
      enviados: resultado.successCount,
      fallidos: resultado.failureCount,
    }
  }
}
