export type ErrorDataDto = {
  causa: string
  accion: string
}

export class ErrorResponseDto {
  finalizado: boolean
  codigo: number
  timestamp: number
  mensaje: string
  datos?: ErrorDataDto
}
