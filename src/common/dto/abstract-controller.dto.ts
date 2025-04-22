import { BadRequestException } from '@nestjs/common'
import { Messages } from '../constants/response-messages'
import { SuccessResponseDto } from './success-response.dto'
import { Request } from 'express'

type ListaCantidadType<T> = [Array<T>, number]

export abstract class AbstractController {
  makeResponse<T>(data: T, message: string): SuccessResponseDto<T> {
    const body = {
      finalizado: true,
      mensaje: message,
      datos: data,
    }
    return body
  }

  success<T>(
    data: T,
    message = Messages.SUCCESS_DEFAULT
  ): SuccessResponseDto<T> {
    return this.makeResponse(data, message)
  }

  successList<T>(
    data: T,
    message = Messages.SUCCESS_LIST
  ): SuccessResponseDto<T> {
    return this.makeResponse(data, message)
  }

  successUpdate<T>(
    data: T,
    message = Messages.SUCCESS_UPDATE
  ): SuccessResponseDto<T> {
    return this.makeResponse(data, message)
  }

  successDelete<T>(
    data: T,
    message = Messages.SUCCESS_DELETE
  ): SuccessResponseDto<T> {
    return this.makeResponse(data, message)
  }

  successCreate<T>(
    data: T,
    message = Messages.SUCCESS_CREATE
  ): SuccessResponseDto<T> {
    return this.makeResponse(data, message)
  }

  successListRows<T>(
    data: ListaCantidadType<T>,
    message = Messages.SUCCESS_LIST
  ): SuccessResponseDto<{ total: number; filas: Array<T> }> {
    const [filas, total] = data
    return this.makeResponse({ total, filas }, message)
  }

  getUser(req: Request) {
    if (req?.user?.id) {
      return req.user.id
    }
    throw new BadRequestException(
      `Es necesario que esté autenticado para consumir este recurso.`
    )
  }
  getUsuarioRol(req: Request) {
    if (req?.user?.idUsuarioRol) {
      return req.user.idUsuarioRol
    }
    throw new BadRequestException(
      `Es necesario que esté autenticado para consumir este recurso.`
    )
  }
  getRol(req: Request): string {
    if (req?.user?.idRol) {
      return String(req.user.idRol)
    }
    throw new BadRequestException(
      'Su cuenta no tiene permisos o roles configurados'
    )
  }
}
