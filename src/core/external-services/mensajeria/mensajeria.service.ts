import { Inject, Injectable, RequestTimeoutException } from '@nestjs/common'
import { EnviarMensajeDto } from './dto/enviar-mensaje.dto'
import * as nodemailer from 'nodemailer'
import { BaseService } from '@/common/base'
import { mensajeriaConfig } from './mensajeria.config'
import { ConfigType } from '@nestjs/config'
import { SentMessageInfo, Transporter } from 'nodemailer'
@Injectable()
export class MensajeriaService extends BaseService {
  constructor(
    @Inject(mensajeriaConfig.KEY)
    private readonly config: ConfigType<typeof mensajeriaConfig>
  ) {
    super()
  }

  private crearTransporter(): Transporter {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.mailUser,
        pass: this.config.mailPass,
      },
    })
  }

  async enviarCorreo(dto: EnviarMensajeDto) {
    if (
      !this.config.mailUser ||
      this.config.mailUser === '' ||
      !this.config.mailPass ||
      this.config.mailPass === ''
    ) {
      this.logger.warn(
        'Configuración de correo no está completa: MAIL_USER o MAIL_PASS no están configurados'
      )
      return {
        finalizado: false,
        mensaje: 'Configuración de correo no está completa',
        error: 'MAIL_USER o MAIL_PASS no están configurados',
      }
    }

    const emailBody = {
      para: [dto.para],
      asunto: dto.asunto,
      contenido: dto.mensaje,
    }

    const t1 = Date.now()

    const sendPromise: Promise<SentMessageInfo> = new Promise(
      (resolve, reject) => {
        const transporter = this.crearTransporter()

        transporter.sendMail(
          {
            from: this.config.mailUser,
            to: dto.para,
            subject: dto.asunto,
            text: dto.mensaje,
            html: dto.mensaje,
          },
          (error, info) => {
            if (error) return reject(error)
            return resolve(info)
          }
        )
      }
    )

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => {
        reject(
          new RequestTimeoutException('La solicitud está demorando demasiado')
        )
      }, this.config.mailTimeout * 1000)
    )

    try {
      const resultado: SentMessageInfo = await Promise.race([
        sendPromise,
        timeoutPromise,
      ])
      const t2 = Date.now()

      this.logger.info('E-MAIL enviado correctamente')
      this.logger.trace({
        mensaje: 'Correo auditado correctamente',
        metadata: {
          status: 200,
          elapsedTimeMs: t2 - t1,
          asunto: emailBody.asunto,
        },
      })

      return {
        finalizado: true,
        mensaje: 'Correo enviado correctamente',
        resultado: resultado,
      }
    } catch (error) {
      const mensaje = 'Ocurrió un error al enviar el mensaje por E-MAIL'
      this.logger.error(`${mensaje}: ${error.message}`)

      // throw new ExternalServiceException('MENSAJERÍA:CORREO', error, mensaje)
      return {
        finalizado: false,
        mensaje,
        error: error.message,
      }
    }
  }
}
