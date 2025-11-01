import { BaseService } from '@/common/base/base-service'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { ArchivoAdjuntoDto } from '../dtos/historia-clinica.dto'
import { ArchivoRepository } from '../repositories/archivo.repository'

@Injectable()
export class ArchivoAdjuntoService extends BaseService {
  constructor(private readonly archivoRepository: ArchivoRepository) {
    super()
  }

  async crearArchivo({
    idHistoriaClinica,
    data,
    usuarioAuditoria,
    transaccion,
    idAntecedente,
  }: {
    idHistoriaClinica: string
    data: ArchivoAdjuntoDto
    usuarioAuditoria: string
    transaccion?: EntityManager
    idAntecedente?: string
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearArchivo({
          idHistoriaClinica,
          data,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
          idAntecedente,
        })
      }
      return await this.archivoRepository.runTransaction(op)
    }

    const archivoAdjunto = await this.archivoRepository.crearArchivo({
      idHistoriaClinica,
      data,
      usuarioAuditoria,
      transaccion,
      idAntecedente,
    })
    return archivoAdjunto
  }
}
