import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  PreconditionFailedException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common'
import { HttpMessages } from '../messages'
import { ObjectOrError } from '../types'

export function traducirMensaje(mensaje: string) {
  if (mensaje === 'Forbidden resource') {
    return HttpMessages.EXCEPTION_FORBIDDEN
  }
  return mensaje
}

export function extractMessage(exception: HttpException): string {
  const response = exception.getResponse() as ObjectOrError | string
  if (typeof response === 'string') {
    return traducirMensaje(response)
  }

  if (response.message && response.error) {
    if (typeof response.message === 'string') {
      return traducirMensaje(response.message)
    }

    const unicoMensajeTipoString =
      Array.isArray(response.message) &&
      response.message.length === 1 &&
      typeof response.message[0] === 'string'

    if (unicoMensajeTipoString) {
      return traducirMensaje(response.message[0])
    }
  }

  if (exception.constructor === BadRequestException) {
    return HttpMessages.EXCEPTION_BAD_REQUEST
  }

  if (exception.constructor === UnauthorizedException) {
    return HttpMessages.EXCEPTION_UNAUTHORIZED
  }

  if (exception.constructor === NotFoundException) {
    return HttpMessages.EXCEPTION_NOT_FOUND
  }

  if (exception.constructor === PreconditionFailedException) {
    return HttpMessages.EXCEPTION_PRECONDITION_FAILED
  }

  if (exception.constructor === ForbiddenException) {
    return HttpMessages.EXCEPTION_FORBIDDEN
  }

  if (exception.constructor === RequestTimeoutException) {
    return HttpMessages.EXCEPTION_REQUEST_TIMEOUT
  }

  return HttpMessages.EXCEPTION_INTERNAL_SERVER_ERROR
}
