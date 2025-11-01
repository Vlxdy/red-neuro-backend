import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { Antecedente } from '../entities/antecedente.entity'
import { CreateAntecedenteDto } from '../dtos/antecedentes.dto'
import {
  AntecedenteEstadoRegistro,
  AntecedenteFuenteDatos,
} from '../constants/antecedentes.constants'
import { Status } from '@/common/constants'

@Injectable()
export class AntecedenteRepository {
  constructor(private dataSource: DataSource) {}

  async crearAntecedente({
    idHistoriaClinica,
    usuarioAuditoria,
    data,
    transaccion,
    version,
    estadoRegistro,
    motivoActualizacion,
    fuenteDatos,
    idEvaluacionNutricionalOrigen,
    fechaCierre,
  }: {
    idHistoriaClinica: string
    data: CreateAntecedenteDto
    usuarioAuditoria: string
    transaccion: EntityManager
    version: number
    estadoRegistro: AntecedenteEstadoRegistro
    motivoActualizacion?: string
    fuenteDatos: AntecedenteFuenteDatos
    idEvaluacionNutricionalOrigen?: string
    fechaCierre?: Date | null
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
      estadoRegistro,
      motivoActualizacion,
      version,
      fuenteDatos,
      idEvaluacionNutricionalOrigen,
      fechaCierre: fechaCierre ?? null,
    })
    return await transaccion.getRepository(Antecedente).save(historialMedico)
  }

  async actualizarAntecedente({
    id,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    id: string
    data: Partial<CreateAntecedenteDto> & {
      estadoRegistro?: AntecedenteEstadoRegistro
      motivoActualizacion?: string | null
      fuenteDatos?: AntecedenteFuenteDatos
      idEvaluacionNutricionalOrigen?: string | null
      version?: number
      fechaCierre?: Date | null
    }
    usuarioAuditoria: string
    transaccion?: EntityManager
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
      estadoRegistro,
      motivoActualizacion,
      fuenteDatos,
      idEvaluacionNutricionalOrigen,
      version,
      fechaCierre,
    } = data
    const sanitizedData: Record<string, unknown> = {}
    const assignIfDefined = (key: string, value: unknown) => {
      if (typeof value !== 'undefined') {
        sanitizedData[key] = value
      }
    }

    assignIfDefined('enfermedadDiagnosticada', enfermedadDiagnosticada)
    assignIfDefined('antecedentesFamiliares', antecedentesFamiliares)
    assignIfDefined('sigueTratamiento', sigueTratamiento)
    assignIfDefined('tieneCirugia', tieneCirugia)
    assignIfDefined('tieneDiarrea', tieneDiarrea)
    assignIfDefined('tieneEstrenimiento', tieneEstrenimiento)
    assignIfDefined('tieneNauseas', tieneNauseas)
    assignIfDefined('tieneVomitos', tieneVomitos)
    assignIfDefined('alergias', alergias)
    assignIfDefined('colicos', colicos)
    assignIfDefined('descripcionCirugia', descripcionCirugia)
    assignIfDefined('descripcionEnfermedad', descripcionEnfermedad)
    assignIfDefined('descripcionTratamiento', descripcionTratamiento)
    assignIfDefined('dietasAnteriores', dietasAnteriores)
    assignIfDefined('fechaUltimaMenstruacion', fechaUltimaMenstruacion)
    assignIfDefined('frecuenciaEvacuacion', frecuenciaEvacuacion)
    assignIfDefined('intolerancias', intolerancias)
    assignIfDefined('menstruacionRegular', menstruacionRegular)
    assignIfDefined('metodoAnticonceptivo', metodoAnticonceptivo)
    assignIfDefined('tipoDeposicion', tipoDeposicion)
    assignIfDefined('estadoRegistro', estadoRegistro)
    assignIfDefined('motivoActualizacion', motivoActualizacion ?? null)
    assignIfDefined('fuenteDatos', fuenteDatos)
    assignIfDefined(
      'idEvaluacionNutricionalOrigen',
      typeof idEvaluacionNutricionalOrigen === 'undefined'
        ? undefined
        : (idEvaluacionNutricionalOrigen ?? null)
    )
    assignIfDefined('version', version)
    assignIfDefined(
      'fechaCierre',
      typeof fechaCierre === 'undefined' ? undefined : (fechaCierre ?? null)
    )

    const repo = (transaccion || this.dataSource).getRepository(Antecedente)
    return await repo.update(
      id,
      new Antecedente({
        usuarioModificacion: usuarioAuditoria,
        ...sanitizedData,
      })
    )
  }

  async buscarPorHistoriaClinica(
    idHistoriaClinica: string,
    transaccion?: EntityManager,
    estadoRegistro?: AntecedenteEstadoRegistro
  ) {
    const query = this.buildQuery(transaccion)
      .where('antecedente.idHistoriaClinica = :idHistoriaClinica', {
        idHistoriaClinica,
      })
      .orderBy('antecedente.version', 'DESC')
      .addOrderBy('antecedente.id', 'DESC')

    if (estadoRegistro) {
      query.andWhere('antecedente.estadoRegistro = :estadoRegistro', {
        estadoRegistro,
      })
    }

    return await query.getOne()
  }

  async buscarVersionVigente(
    idHistoriaClinica: string,
    transaccion?: EntityManager
  ) {
    return await this.buscarPorHistoriaClinica(
      idHistoriaClinica,
      transaccion,
      AntecedenteEstadoRegistro.COMPLETO
    )
  }

  async buscarUltimaVersion(
    idHistoriaClinica: string,
    transaccion?: EntityManager
  ) {
    return await this.buscarPorHistoriaClinica(idHistoriaClinica, transaccion)
  }

  async listarVersionesPorHistoriaClinica(
    idHistoriaClinica: string,
    transaccion?: EntityManager
  ) {
    return await this.buildQuery(transaccion)
      .where('antecedente.idHistoriaClinica = :idHistoriaClinica', {
        idHistoriaClinica,
      })
      .orderBy('antecedente.version', 'DESC')
      .addOrderBy('antecedente.id', 'DESC')
      .getMany()
  }

  async buscarPorVersion(
    idHistoriaClinica: string,
    version: number,
    transaccion?: EntityManager
  ) {
    return await this.buildQuery(transaccion)
      .where('antecedente.idHistoriaClinica = :idHistoriaClinica', {
        idHistoriaClinica,
      })
      .andWhere('antecedente.version = :version', { version })
      .getOne()
  }

  async buscarPorId(id: string, transaccion?: EntityManager) {
    return await this.buildQuery(transaccion)
      .where('antecedente.id = :id', { id })
      .getOne()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }

  private buildQuery(transaccion?: EntityManager) {
    return (transaccion || this.dataSource)
      .getRepository(Antecedente)
      .createQueryBuilder('antecedente')
      .leftJoinAndSelect(
        'antecedente.archivos',
        'archivo',
        'archivo.estado = :estadoActivo',
        { estadoActivo: Status.ACTIVE }
      )
  }
}
