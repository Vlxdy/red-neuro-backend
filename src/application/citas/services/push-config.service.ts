import { Injectable } from '@nestjs/common'
import fs from 'node:fs'

@Injectable()
export class PushConfigService {
  obtenerRutaCredenciales(): string {
    return process.env.FCM_CREDENTIALS_FILE || ''
  }

  validarCredencialesFirebaseDesdeArchivo(): {
    valido: boolean
    ruta: string
    projectId?: string
    clientEmail?: string
    error?: string
  } {
    const ruta = this.obtenerRutaCredenciales()

    if (!ruta) {
      return {
        valido: false,
        ruta,
        error: 'FCM_CREDENTIALS_FILE no está configurado',
      }
    }

    if (!fs.existsSync(ruta)) {
      return {
        valido: false,
        ruta,
        error: 'El archivo de credenciales no existe en la ruta configurada',
      }
    }

    try {
      const raw = fs.readFileSync(ruta, 'utf-8')
      const json = JSON.parse(raw)

      if (!json.project_id || !json.client_email || !json.private_key) {
        return {
          valido: false,
          ruta,
          error:
            'El JSON no contiene project_id, client_email o private_key requeridos',
        }
      }

      return {
        valido: true,
        ruta,
        projectId: json.project_id,
        clientEmail: json.client_email,
      }
    } catch (error) {
      return {
        valido: false,
        ruta,
        error: error.message,
      }
    }
  }
}
