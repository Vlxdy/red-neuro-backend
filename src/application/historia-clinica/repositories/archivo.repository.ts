import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { ArchivoAdjuntoDto } from '../dtos/historial-medico.dto'
import { ArchivoAdjunto } from '../entities/archivos-adjunto.entity'

@Injectable()
export class ArchivoRepository {
  constructor(private dataSource: DataSource) {}

  async crearArchivo({
    idHistoriaClinica,
    usuarioAuditoria,
    data,
    transaccion,
  }: {
    idHistoriaClinica: string
    data: ArchivoAdjuntoDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const { contenidoBase64, nombreArchivo, tipoArchivo } = data
    const historialMedico = new ArchivoAdjunto({
      idHistoriaClinica,
      contenidoBase64,
      nombreArchivo,
      tipoArchivo,
      usuarioCreacion: usuarioAuditoria,
    })
    return await transaccion.getRepository(ArchivoAdjunto).save(historialMedico)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
