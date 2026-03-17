import { Test, TestingModule } from '@nestjs/testing'
import { MensajeriaService } from './mensajeria.service'
import { mensajeriaConfig } from './mensajeria.config'
import * as nodemailer from 'nodemailer'
import { SentMessageInfo } from 'nodemailer'

// Mock de nodemailer para controlar su comportamiento
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}))

const mockMailUser = 'test@gmail.com'
const mockMailPass = 'testpass'
const mockMailTimeout = 5

describe('MensajeriaService', () => {
  let service: MensajeriaService
  let mockSendMail: jest.Mock

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MensajeriaService,
        {
          provide: mensajeriaConfig.KEY,
          useValue: {
            mailUser: mockMailUser,
            mailPass: mockMailPass,
            mailTimeout: mockMailTimeout,
          },
        },
      ],
    }).compile()

    service = module.get<MensajeriaService>(MensajeriaService)
    mockSendMail = (nodemailer.createTransport as jest.Mock)().sendMail

    // Limpiar mocks antes de cada prueba
    mockSendMail.mockClear()
    jest.clearAllTimers() // Limpiar temporizadores para pruebas de timeout
    jest.useFakeTimers() // Usar temporizadores falsos para controlar el tiempo
  })

  afterEach(() => {
    jest.useRealTimers() // Volver a usar temporizadores reales después de cada prueba
  })

  it('debería estar definido', () => {
    expect(service).toBeDefined()
  })

  describe('enviarCorreo', () => {
    const dto = {
      para: 'recipient@example.com',
      asunto: 'Asunto de Prueba',
      mensaje: 'Mensaje de Prueba',
    }

    it('debería retornar un error si mailUser o mailPass no están configurados', async () => {
      // Sobrescribir la configuración para esta prueba
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MensajeriaService,
          {
            provide: mensajeriaConfig.KEY,
            useValue: {
              mailUser: '',
              mailPass: '',
              mailTimeout: mockMailTimeout,
            },
          },
        ],
      }).compile()
      const serviceWithoutConfig =
        module.get<MensajeriaService>(MensajeriaService)

      const result = await serviceWithoutConfig.enviarCorreo(dto)

      expect(result).toEqual({
        finalizado: false,
        mensaje: 'Configuración de correo no está completa',
        error: 'MAIL_USER o MAIL_PASS no están configurados',
      })
      expect(mockSendMail).not.toHaveBeenCalled()
    })

    it('debería enviar un correo exitosamente', async () => {
      const mockInfo: SentMessageInfo = {
        messageId: 'abc-123',
        envelope: {},
        accepted: [dto.para],
        rejected: [],
        pending: [],
        response: '250 OK',
      }
      mockSendMail.mockImplementationOnce((mailOptions, callback) => {
        callback(null, mockInfo)
      })

      const result = await service.enviarCorreo(dto)

      expect(mockSendMail).toHaveBeenCalledWith(
        {
          from: mockMailUser,
          to: dto.para,
          subject: dto.asunto,
          text: dto.mensaje,
          html: dto.mensaje,
          attachments: undefined,
        },
        expect.any(Function)
      )
      expect(result).toEqual({
        finalizado: true,
        mensaje: 'Correo enviado correctamente',
        resultado: mockInfo,
      })
    })

    it('debería manejar un error al enviar el correo', async () => {
      const mockError = new Error('Nodemailer falló al enviar')
      mockSendMail.mockImplementationOnce((mailOptions, callback) => {
        callback(mockError)
      })

      const result = await service.enviarCorreo(dto)

      expect(mockSendMail).toHaveBeenCalled()
      expect(result).toEqual({
        finalizado: false,
        mensaje: 'Ocurrió un error al enviar el mensaje por E-MAIL',
        error: mockError.message,
      })
    })

    it('debería lanzar RequestTimeoutException si el envío del correo tarda demasiado', async () => {
      mockSendMail.mockImplementationOnce(() => {
        // Simular un retraso largo que excede el tiempo de espera
        // No llamar al callback inmediatamente
      })

      const sendPromise = service.enviarCorreo(dto)

      // Avanzar los temporizadores más allá del tiempo de espera
      jest.advanceTimersByTime(mockMailTimeout * 1000 + 100) // 100ms extra para asegurar el timeout

      const result = await sendPromise

      expect(mockSendMail).toHaveBeenCalled()
      expect(result).toEqual({
        finalizado: false,
        mensaje: 'Ocurrió un error al enviar el mensaje por E-MAIL',
        error: 'La solicitud está demorando demasiado',
      })
    })
  })
})
