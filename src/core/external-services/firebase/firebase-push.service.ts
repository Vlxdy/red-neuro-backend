import { Inject, Injectable, Logger } from '@nestjs/common'
import { Messaging } from 'firebase-admin/messaging'
import { FIREBASE_MESSAGING } from './firebase.constants'

@Injectable()
export class FirebasePushService {
  private readonly logger = new Logger(FirebasePushService.name)

  constructor(
    @Inject(FIREBASE_MESSAGING)
    private readonly messaging: Messaging
  ) {}

  async sendToToken(params: {
    token: string
    title: string
    body: string
    data?: Record<string, string>
  }): Promise<string> {
    const { token, title, body, data } = params

    try {
      return await this.messaging.send({
        token,
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: 'high',
        },
      })
    } catch (error) {
      this.logger.error('Error enviando notificación push', error)
      throw error
    }
  }

  async sendToMany(params: {
    tokens: string[]
    title: string
    body: string
    data?: Record<string, string>
  }) {
    const { tokens, title, body, data } = params

    if (!tokens.length) {
      return { successCount: 0, failureCount: 0, responses: [] }
    }

    return await this.messaging.sendEachForMulticast({
      tokens,
      notification: {
        title,
        body,
      },
      data,
      android: {
        priority: 'high',
      },
    })
  }
}
