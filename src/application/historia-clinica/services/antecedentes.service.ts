import { BaseService } from '@/common/base/base-service'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { AntecedenteRepository } from '../repositories/antecedentes.repository'
import { CreateAntecedenteDto } from '../dtos/antecedentes.dto'
import { Antecedente } from '../entities/antecedente.entity'
import { AntecedenteResponse } from '@/common/types/data-response.type'

@Injectable()
export class AntecedenteService extends BaseService {
  constructor(private readonly antecedenteRepository: AntecedenteRepository) {
    super()
  }

  async crearAntecedente({
    idHistoriaClinica,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idHistoriaClinica: string
    data: CreateAntecedenteDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearAntecedente({
          idHistoriaClinica,
          data,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }
      return await this.antecedenteRepository.runTransaction(op)
    }
    // TODO: Verificar si la historia clínica existe
    // Validar permisos

    const archivoAdjunto = await this.antecedenteRepository.crearAntecedente({
      idHistoriaClinica,
      data,
      usuarioAuditoria,
      transaccion,
    })
    return archivoAdjunto
  }

  async buscarAntecedentePorHistoriaClinica(idHistoriaClinica: string) {
    const antecedente =
      await this.antecedenteRepository.buscarPorHistoriaClinica(
        idHistoriaClinica
      )

    // if (!antecedente) {
    //   throw new PreconditionFailedException('No se encontró el antecedente')
    // }

    return antecedente ? this.formatarRespuestaAntecedente(antecedente) : null
  }

  formatarRespuestaAntecedente(antecedente: Antecedente): AntecedenteResponse {
    const { archivos } = antecedente

    return {
      id: antecedente.id,
      enfermedadDiagnosticada: antecedente.enfermedadDiagnosticada,
      antecedentesFamiliares: antecedente.antecedentesFamiliares,
      sigueTratamiento: antecedente.sigueTratamiento,
      tieneCirugia: antecedente.tieneCirugia,
      tieneDiarrea: antecedente.tieneDiarrea,
      tieneEstrenimiento: antecedente.tieneEstrenimiento,
      tieneNauseas: antecedente.tieneNauseas,
      tieneVomitos: antecedente.tieneVomitos,
      alergias: antecedente.alergias,
      colicos: antecedente.colicos,
      descripcionCirugia: antecedente.descripcionCirugia,
      descripcionEnfermedad: antecedente.descripcionEnfermedad,
      descripcionTratamiento: antecedente.descripcionTratamiento,
      dietasAnteriores: antecedente.dietasAnteriores,
      fechaUltimaMenstruacion: antecedente.fechaUltimaMenstruacion as string,
      frecuenciaEvacuacion: antecedente.frecuenciaEvacuacion,
      intolerancias: antecedente.intolerancias,
      menstruacionRegular: antecedente.menstruacionRegular,
      metodoAnticonceptivo: antecedente.metodoAnticonceptivo,
      tipoDeposicion: antecedente.tipoDeposicion,
      estado: antecedente.estado,
      fechaCreacion: antecedente.fechaCreacion,
      idHistoriaClinica: antecedente.idHistoriaClinica,
      archivos:
        archivos?.map((archivo) => ({
          id: archivo.id,
          codigo: archivo.codigo,
          contenidoBase64: archivo.contenidoBase64,
          nombreArchivo: archivo.nombreArchivo,
          tipoArchivo: archivo.tipoArchivo,
          fechaCreacion: archivo.fechaCreacion,
          estado: archivo.estado,
          idHistoriaClinica: archivo.idHistoriaClinica,
          idEvaluacionNutricional: archivo.idEvaluacionNutricional,
        })) || null,
    }
  }
}
