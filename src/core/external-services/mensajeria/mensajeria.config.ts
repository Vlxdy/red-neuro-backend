import { registerAs } from '@nestjs/config'

export const mensajeriaConfig = registerAs('mensajeria', () => ({
  mailUser: process.env.EMAIL_USER,
  mailPass: process.env.EMAIL_PASSWORD,
  mailTimeout: Number(process.env.EMAIL_RESPONSE_TIMEOUT || '10'),
}))
