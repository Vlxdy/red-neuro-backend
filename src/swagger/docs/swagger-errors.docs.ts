import { ErrorResponseDto } from '@/common/dto/error-response.dto'
import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Catálogo de errores')
@Controller('docs/errors')
export class SwaggerErrorsDocumentationController {
  @Get('estructura')
  @ApiOperation({
    summary: 'Estructura general del error',
    description: 'Todos los errores de la API siguen esta estructura JSON.',
  })

  // 👉 400 — Solicitud inválida
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida',
    type: ErrorResponseDto,
  })

  // 👉 401 — No autorizado
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
    type: ErrorResponseDto,
  })

  // 👉 403 — Acceso prohibido
  @ApiResponse({
    status: 403,
    description: 'Acceso prohibido',
    type: ErrorResponseDto,
  })

  // 👉 404 — Recurso no encontrado
  @ApiResponse({
    status: 404,
    description: 'Recurso no encontrado',
    type: ErrorResponseDto,
  })

  // 👉 412 — Precondición fallida
  @ApiResponse({
    status: 412,
    description: 'Precondición fallida',
    type: ErrorResponseDto,
  })

  // 👉 500 — Error interno del servidor
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
    type: ErrorResponseDto,
  })
  docErrorStructure() {}
}
