import { ErrorResponseDto } from '../error-response.dto'

export function addGlobalErrorResponses(document: any) {
  const errorSchema = ErrorResponseDto

  const RESPONSES = {
    400: 'Solicitud inválida',
    401: 'No autorizado',
    403: 'Acceso prohibido',
    404: 'Recurso no encontrado',
    412: 'Precondición fallida',
    500: 'Error interno',
  }

  for (const pathKey of Object.keys(document.paths)) {
    const path = document.paths[pathKey]

    for (const methodKey of Object.keys(path)) {
      const endpoint = path[methodKey]

      for (const [code, description] of Object.entries(RESPONSES)) {
        endpoint.responses[code] =
          endpoint.responses[code] ||
          createErrorResponse(description, errorSchema)
      }
    }
  }

  return document
}

function createErrorResponse(description: string, errorSchema: any) {
  return {
    description,
    content: {
      'application/json': {
        schema: errorSchema,
      },
    },
  }
}
