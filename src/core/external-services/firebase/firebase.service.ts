import { Injectable } from '@nestjs/common'
import fs from 'node:fs'

type FirebaseApp = unknown

@Injectable()
export class FirebaseService {
  private app: FirebaseApp | null = null

  private getAdminAppModule() {
    // Implementación basada en la librería oficial firebase-admin
    return require('firebase-admin/app') as {
      cert: (serviceAccount: unknown) => unknown
      getApps: () => FirebaseApp[]
      getApp: () => FirebaseApp
      initializeApp: (options: { credential: unknown }) => FirebaseApp
    }
  }

  private cargarServiceAccount(): unknown {
    const filePath = process.env.FCM_CREDENTIALS_FILE
    if (!filePath) {
      throw new Error('FCM_CREDENTIALS_FILE no está configurado')
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`No existe el archivo de credenciales en ${filePath}`)
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  }

  obtenerApp(): FirebaseApp {
    if (this.app) {
      return this.app
    }

    const adminApp = this.getAdminAppModule()
    const apps = adminApp.getApps()

    if (apps.length > 0) {
      this.app = adminApp.getApp()
      return this.app
    }

    const serviceAccount = this.cargarServiceAccount()
    this.app = adminApp.initializeApp({
      credential: adminApp.cert(serviceAccount),
    })

    return this.app
  }
}
