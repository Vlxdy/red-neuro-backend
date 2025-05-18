import { BaseService } from '@/common/base/base-service'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { ArchivoAdjuntoDto } from '../dtos/historial-medico.dto'
import { ArchivoRepository } from '../repositories/archivo.repository'

@Injectable()
export class ArchivoAdjuntoService extends BaseService {
  constructor(private readonly archivoRepository: ArchivoRepository) {
    super()
  }

  async crearArchivo({
    idHistorialMedico,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idHistorialMedico: string
    data: ArchivoAdjuntoDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearArchivo({
          idHistorialMedico,
          data,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }
      return await this.archivoRepository.runTransaction(op)
    }

    const archivoAdjunto = await this.archivoRepository.crearArchivo({
      idHistorialMedico,
      data,
      usuarioAuditoria,
      transaccion,
    })
    return archivoAdjunto
  }
}
