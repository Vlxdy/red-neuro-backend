import 'express-session'

declare global {
  type PassportUser = {
    id: string // colocar el tipo según el modelo usuario.entity
    roles: Array<string>
    idRol?: string // rol principal
    rol?: string // rol principal
    idToken?: string
    accessToken?: string
    refreshToken?: string
    exp?: number
    iat?: number
  }

  type PayloadType = {
    id: string
    roles: Array<string>
    idRol?: string // rol principal
    rol?: string // rol principal
    exp?: number
    iat?: number
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: PassportUser
  }
}

declare module 'express-session' {
  interface SessionData {
    origen: string
    passport: {
      user: PassportUser
    }
  }
}
