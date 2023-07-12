// response messages

export enum Messages {
  // generic Messages exceptions
  EXCEPTION_BAD_REQUEST = 'La solicitud no se puede completar, existen errores de validación.',
  EXCEPTION_UNAUTHORIZED = 'Usuario no autorizado',
  EXCEPTION_FORBIDDEN = 'No tienes permisos para realizar la acción sobre el recurso solicitado.',
  EXCEPTION_NOT_FOUND = 'Recurso no encontrado',
  EXCEPTION_PRECONDITION_FAILED = 'La solicitud no cumple una condición previa.',
  EXCEPTION_DEFAULT = 'Ocurrio un error desconocido',
  EXCEPTION_REFRESH_TOKEN_NOT_FOUND = 'Sesión finalizada.',
  EXCEPTION_REFRESH_TOKEN_EXPIRED = 'Sesión expirada por inactividad.',
  EXCEPTION_INTERNAL_SERVER_ERROR = 'Ocurrió un error interno.',

  // generic messages success
  SUCCESS_DEFAULT = '¡Tarea completada con éxito!',
  SUCCESS_LIST = 'Registro(s) obtenido(s) con éxito!',
  SUCCESS_CREATE = 'Registro creado con éxito!',
  SUCCESS_UPDATE = 'Registro actualizado con éxito!',
  SUCCESS_DELETE = 'Registro eliminado con éxito!',

  // business logic messages
  SUCCESS_RESTART_PASSWORD = 'La nueva contraseña ha sido enviada por correo',
  SUCCESS_RESEND_MAIL_ACTIVATION = 'Un nuevo correo de activación ha sido enviado',
  SUCCESS_ACCOUNT_UNLOCK = 'Cuenta desbloqueada exitosamente.',
  INVALID_USER_CREDENTIALS = 'Usuario o contraseña invalidos.',
  NO_PERMISSION_USER = 'El usuario no tiene roles asignados',
  INVALID_USER = 'El usuario no existe o no contiene un estado valido.',
  INVALID_CREDENTIALS = 'Credenciales incorrectas!!!',
  INACTIVE_USER = 'El usuario se encuentra INACTIVO',
  PENDING_USER = 'El usuario se encuentra en estado pendiente de activación, revisa tu correo electrónico',
  INACTIVE_PERSON = 'El registro de persona se encuentra INACTIVO',
  INVALID_PASSWORD_SCORE = 'La contraseña nueva no cumple el nivel de seguridad necesario.',
  USER_BLOCKED = 'Usuario bloqueado por muchos intentos de sesión fallidos, revisa tu correo electrónico.',
  SUBJECT_EMAIL_ACCOUNT_ACTIVE = 'Generación de credenciales.',
  SUBJECT_EMAIL_ACCOUNT_RECOVERY = 'Revisa tu bandeja de correo, enviamos un enlace para que puedas recuperar tu cuenta',
  SUBJECT_EMAIL_ACCOUNT_RESET = 'Restauración de contraseña.',
  SUBJECT_EMAIL_ACCOUNT_LOCKED = 'Bloqueo de cuenta temporal.',
  EXISTING_USER = 'Ya existe un usuario registrado con el mismo número de documento.',
  EXISTING_EMAIL = 'Ya existe un usuario registrado con el mismo correo electrónico.',
  NEW_USER_ACCOUNT = 'Usuario creado exitosamente!',
  NEW_USER_ACCOUNT_VERIFY = 'Activación de cuenta',
  ACCOUNT_ACTIVED_SUCCESSFULLY = '¡Activación de cuenta exitosa!',

  // Parámetros
  REPEATED_PARAMETER = 'Parámetro repetido',
}
