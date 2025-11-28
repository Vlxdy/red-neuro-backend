import { applyDecorators } from '@nestjs/common'
import { ApiExtraModels, ApiResponse } from '@nestjs/swagger'
import { ErrorResponseDto } from '../dto/error-response.dto'

export function ApiErrorResponses() {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),

    ApiResponse({
      status: 400,
      description: 'Solicitud inválida',
      type: ErrorResponseDto,
    }),

    ApiResponse({
      status: 401,
      description: 'No autorizado',
      type: ErrorResponseDto,
      content: {
        'application/json': {
          examples: {
            Unauthorized: {
              summary: 'Token inválido',
              value: {
                finalizado: false,
                mensaje: 'Token inválido o expirado',
                datos: null,
              },
            },
          },
        },
      },
    }),

    ApiResponse({
      status: 403,
      description: 'Acceso prohibido',
      type: ErrorResponseDto,
    }),

    ApiResponse({
      status: 404,
      description: 'Recurso no encontrado',
      type: ErrorResponseDto,
    }),

    ApiResponse({
      status: 412,
      description: 'Precondición fallida',
      type: ErrorResponseDto,
    }),

    ApiResponse({
      status: 500,
      description: 'Error interno',
      type: ErrorResponseDto,
    })
  )
}
