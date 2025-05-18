import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { HistorialMedico } from '../entities/historial-medico.entity'
import { ArchivoAdjuntoDto } from '../dtos/historial-medico.dto'
import { ArchivoAdjunto } from '../entities/archivos-adjunto.entity'

@Injectable()
export class ArchivoRepository {
  constructor(private dataSource: DataSource) {}

  async crearArchivo({
    idHistorialMedico,
    usuarioAuditoria,
    data,
    transaccion,
  }: {
    idHistorialMedico: string
    data: ArchivoAdjuntoDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const { contenidoBase64, nombreArchivo, tipoArchivo } = data
    const historialMedico = new ArchivoAdjunto({
      idHistorialMedico,
      contenidoBase64,
      nombreArchivo,
      tipoArchivo,
      usuarioCreacion: usuarioAuditoria,
    })
    return await transaccion
      .getRepository(HistorialMedico)
      .save(historialMedico)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
