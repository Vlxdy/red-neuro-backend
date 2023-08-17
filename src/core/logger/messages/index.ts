export enum HttpMessages {
  EXCEPTION_BAD_REQUEST = 'La solicitud no se puede completar, existen errores de validación.',
  EXCEPTION_UNAUTHORIZED = 'Usuario no autorizado.',
  EXCEPTION_FORBIDDEN = 'No tiene permiso para realizar esta acción.',
  EXCEPTION_NOT_FOUND = 'Recurso no encontrado.',
  EXCEPTION_PRECONDITION_FAILED = 'La solicitud no cumple una condición previa.',
  EXCEPTION_INTERNAL_SERVER_ERROR = 'Ocurrió un error inesperado, por favor vuelva a intentarlo o comuníquese con soporte técnico si el problema persiste.',
  EXCEPTION_REQUEST_TIMEOUT = 'La solicitud no se pudo completar, tardó demasiado en responder.',
}
