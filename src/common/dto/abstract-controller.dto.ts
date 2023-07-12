import { BadRequestException } from '@nestjs/common'
import { Messages } from '../constants/response-messages'
import { SuccessResponseDto } from './success-response.dto'

export abstract class AbstractController {
  makeResponse(data, message: string): SuccessResponseDto {
    return {
      finalizado: true,
      mensaje: message,
      datos: data,
    }
  }

  success(data, message = Messages.SUCCESS_DEFAULT): SuccessResponseDto {
    return this.makeResponse(data, message)
  }

  successList(data, message = Messages.SUCCESS_LIST): SuccessResponseDto {
    return this.makeResponse(data, message)
  }

  successUpdate(data, message = Messages.SUCCESS_UPDATE): SuccessResponseDto {
    return this.makeResponse(data, message)
  }

  successDelete(data, message = Messages.SUCCESS_DELETE): SuccessResponseDto {
    return this.makeResponse(data, message)
  }

  successCreate(data, message = Messages.SUCCESS_CREATE): SuccessResponseDto {
    return this.makeResponse(data, message)
  }

  successListRows(data, message = Messages.SUCCESS_LIST): SuccessResponseDto {
    const [filas, total] = data
    return this.makeResponse({ total, filas }, message)
  }

  getUser(req) {
    if (req?.user?.id) {
      return req.user.id
    }
    throw new BadRequestException(
      `Es necesario que esté autenticado para consumir este recurso.`
    )
  }
}
