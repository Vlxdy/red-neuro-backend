import { ValidationPipe, ValidationError, HttpStatus } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { BaseException, ERROR_CODE } from '@/core/logger'
import { HttpMessages } from '@/core/logger/messages'

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BaseException(undefined, {
          codigo: ERROR_CODE.DTO_VALIDATION_ERROR,
          httpStatus: HttpStatus.BAD_REQUEST,
          mensaje: HttpMessages.EXCEPTION_BAD_REQUEST,
          accion: 'Verificar las propiedades definidas en el DTO',
          clientInfo: {
            erroresValidacion: validationErrors.reduce((prev, curr) => {
              prev[curr.property] = Object.values(curr.constraints || {})
              return prev
            }, {}),
          },
        })
      },
    })
  }
}
