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
        // Función recursiva para formatear errores anidados
        const formatErrors = (errors: ValidationError[]) => {
          return errors.reduce((acc, error) => {
            // Si la propiedad tiene errores directos (constraints)
            if (error.constraints) {
              acc[error.property] = Object.values(error.constraints)
            }

            // Si la propiedad tiene errores anidados (children)
            if (error.children && error.children.length > 0) {
              // Si ya había errores directos en la propiedad, los combinamos
              // Si no, simplemente asignamos los errores de los hijos
              acc[error.property] = {
                ...(acc[error.property] || {}), // Asegura que sea un objeto si ya existía o crea uno vacío
                ...formatErrors(error.children), // Llamada recursiva para procesar los hijos
              }
            }
            return acc
          }, {})
        }

        const formattedErrors = formatErrors(validationErrors)
        console.log(
          'Errores de validación formateados para el cliente:',
          formattedErrors
        ) // Para depurar, ver el resultado

        return new BaseException(undefined, {
          codigo: ERROR_CODE.DTO_VALIDATION_ERROR,
          httpStatus: HttpStatus.BAD_REQUEST,
          mensaje: HttpMessages.EXCEPTION_BAD_REQUEST,
          accion: 'Verificar las propiedades definidas en el DTO',
          clientInfo: {
            erroresValidacion: formattedErrors, // Usa los errores formateados recursivamente
          },
        })
      },
    })
  }
}
