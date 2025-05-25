import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Antecedente } from '../entities/antecedente.entity'
import { CreateAntecedenteDto } from '../dtos/antecedentes.dto'

@Injectable()
export class AntecedenteRepository {
  constructor(private dataSource: DataSource) {}

  async crearAntecedente({
    idHistoriaClinica,
    usuarioAuditoria,
    data,
    transaccion,
  }: {
    idHistoriaClinica: string
    data: CreateAntecedenteDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const {
      enfermedadDiagnosticada,
      antecedentesFamiliares,
      sigueTratamiento,
      tieneCirugia,
      tieneDiarrea,
      tieneEstrenimiento,
      tieneNauseas,
      tieneVomitos,
      alergias,
      colicos,
      descripcionCirugia,
      descripcionEnfermedad,
      descripcionTratamiento,
      dietasAnteriores,
      fechaUltimaMenstruacion,
      frecuenciaEvacuacion,
      intolerancias,
      menstruacionRegular,
      metodoAnticonceptivo,
      tipoDeposicion,
    } = data
    const historialMedico = new Antecedente({
      idHistoriaClinica,
      usuarioCreacion: usuarioAuditoria,
      enfermedadDiagnosticada,
      antecedentesFamiliares,
      sigueTratamiento,
      tieneCirugia,
      tieneDiarrea,
      tieneEstrenimiento,
      tieneNauseas,
      tieneVomitos,
      alergias,
      colicos,
      descripcionCirugia,
      descripcionEnfermedad,
      descripcionTratamiento,
      dietasAnteriores,
      fechaUltimaMenstruacion,
      frecuenciaEvacuacion,
      intolerancias,
      menstruacionRegular,
      metodoAnticonceptivo,
      tipoDeposicion,
    })
    return await transaccion.getRepository(Antecedente).save(historialMedico)
  }

  async actualizarAntecedente({
    id,
    data,
    usuarioAuditoria,
  }: {
    id: string
    data: Partial<CreateAntecedenteDto>
    usuarioAuditoria: string
  }) {
    const {
      enfermedadDiagnosticada,
      antecedentesFamiliares,
      sigueTratamiento,
      tieneCirugia,
      tieneDiarrea,
      tieneEstrenimiento,
      tieneNauseas,
      tieneVomitos,
      alergias,
      colicos,
      descripcionCirugia,
      descripcionEnfermedad,
      descripcionTratamiento,
      dietasAnteriores,
      fechaUltimaMenstruacion,
      frecuenciaEvacuacion,
      intolerancias,
      menstruacionRegular,
      metodoAnticonceptivo,
      tipoDeposicion,
    } = data
    const historialMedico = new Antecedente({
      usuarioModificacion: usuarioAuditoria,
      enfermedadDiagnosticada,
      antecedentesFamiliares,
      sigueTratamiento,
      tieneCirugia,
      tieneDiarrea,
      tieneEstrenimiento,
      tieneNauseas,
      tieneVomitos,
      alergias,
      colicos,
      descripcionCirugia,
      descripcionEnfermedad,
      descripcionTratamiento,
      dietasAnteriores,
      fechaUltimaMenstruacion,
      frecuenciaEvacuacion,
      intolerancias,
      menstruacionRegular,
      metodoAnticonceptivo,
      tipoDeposicion,
    })
    return await this.dataSource
      .getRepository(Antecedente)
      .update(id, historialMedico)
  }

  async buscarPorHistoriaClinica(
    idHistoriaClinica: string,
    transaccion?: EntityManager
  ) {
    return await (transaccion || this.dataSource)
      .getRepository(Antecedente)
      .createQueryBuilder('antecedente')
      .where({ idHistoriaClinica })
      .orderBy('antecedente.id', 'DESC')
      .getOne()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
