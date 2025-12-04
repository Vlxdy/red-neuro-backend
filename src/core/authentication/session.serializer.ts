import { PassportSerializer } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'

@Injectable()
export class SessionSerializer<T = unknown> extends PassportSerializer {
  serializeUser(user: T, done: (err: Error | null, user: T) => void): void {
    done(null, user)
  }

  deserializeUser(
    payload: T,
    done: (err: Error | null, user: T) => void
  ): void {
    done(null, payload)
  }
}
