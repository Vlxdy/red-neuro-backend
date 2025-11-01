import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { ArchivoAdjuntoDto } from '../dtos/historia-clinica.dto'
import { ArchivoAdjunto } from '../entities/archivos-adjunto.entity'

@Injectable()
export class ArchivoRepository {
  constructor(private dataSource: DataSource) {}

  async crearArchivo({
    idHistoriaClinica,
    usuarioAuditoria,
    data,
    transaccion,
    idAntecedente,
  }: {
    idHistoriaClinica: string
    data: ArchivoAdjuntoDto
    usuarioAuditoria: string
    transaccion: EntityManager
    idAntecedente?: string
  }) {
    const { contenidoBase64, nombreArchivo, tipoArchivo, metadatos } = data
    const historialMedico = new ArchivoAdjunto({
      idHistoriaClinica,
      contenidoBase64,
      nombreArchivo,
      tipoArchivo,
      usuarioCreacion: usuarioAuditoria,
      idAntecedente: idAntecedente ?? null,
      metadatos,
    })
    return await transaccion.getRepository(ArchivoAdjunto).save(historialMedico)
  }

  async actualizarArchivo({
    id,
    usuarioAuditoria,
    transaccion,
    data,
  }: {
    id: string
    usuarioAuditoria: string
    transaccion: EntityManager
    data: Partial<ArchivoAdjunto>
  }) {
    const repo = transaccion.getRepository(ArchivoAdjunto)
    return await repo.update(
      id,
      new ArchivoAdjunto({
        ...data,
        usuarioModificacion: usuarioAuditoria,
      })
    )
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
