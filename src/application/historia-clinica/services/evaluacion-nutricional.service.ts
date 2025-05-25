import { BaseService } from '@/common/base/base-service'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CrearEvaluacionDto } from '../dtos/evaluacion.dto'
import { EvaluacionNutricionalRepository } from '../repositories/evaluacion-nutricional.repository'
import { HistoriaClinicaService } from './historia-clinico.service'
import { CitasService } from '@/application/gestion-pacientes/services/citas.service'
import { CitasEstado } from '@/application/gestion-pacientes/constant'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { EvaluacionNutricional } from '../entities/evaluacion-nutricional.entity'
import { EvaluacionNutricionalResponde } from '@/common/types/data-response.type'

@Injectable()
export class EvaluacionNutricionalService extends BaseService {
  constructor(
    private evaluacionNutricionalRepositorio: EvaluacionNutricionalRepository,
    private historiaClinicaService: HistoriaClinicaService,
    private citasService: CitasService
  ) {
    super()
  }

  async crearEvaluacion({
    idHistoriaClinica,
    data,
    usuarioAuditoria,
    idMedico,
    transaccion,
  }: {
    idHistoriaClinica: string
    data: CrearEvaluacionDto
    usuarioAuditoria: string
    idMedico: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearEvaluacion({
          idHistoriaClinica,
          data,
          usuarioAuditoria,
          idMedico,
          transaccion: nuevaTransaccion,
        })
      }

      return await this.evaluacionNutricionalRepositorio.runTransaction(op)
    }

    const historiaClinica =
      await this.historiaClinicaService.obtenerHistoriaClinica(
        idHistoriaClinica,
        transaccion
      )

    const calcularIMC = (peso: number, tallaCm: number): number => {
      if (!peso || !tallaCm) return 0
      const tallaM = tallaCm / 100
      return parseFloat((peso / (tallaM * tallaM)).toFixed(2))
    }

    const imc = calcularIMC(data.peso, data.talla)

    const evaluacion = await this.evaluacionNutricionalRepositorio.crear({
      idHistoriaClinica,
      data: {
        ...data,
        imc,
      },
      usuarioAuditoria,
      transaccion,
    })

    const citas = await this.citasService.listarCitasPorPaciente({
      idPaciente: historiaClinica.idPaciente,
      estado: CitasEstado.PENDIENTE,
      transaccion,
    })

    if (citas.length > 0) {
      await this.citasService.actualizarCita({
        idCita: citas[0].id,
        data: {
          estado: CitasEstado.CONCLUIDA,
        },
        idMedico: historiaClinica.idMedico,
        // datosDto: {
        //   estado: CitasEstado.CANCELADA,
        // },
        usuarioAuditoria,
        transaccion,
      })
    }
    return { id: evaluacion.id }
  }

  async listarEvaluacionesPorHistoriaClinica({
    idHistoriaClinica,
    paginacion,
  }: {
    idHistoriaClinica: string
    paginacion: PaginacionQueryDto
  }) {
    const [evalucaciones, numero] =
      await this.evaluacionNutricionalRepositorio.buscarPorHistoriaClinica(
        idHistoriaClinica,
        paginacion
      )

    return [this.formatearEvaluaciones(evalucaciones), numero]
  }

  formatearEvaluaciones(
    evaluaciones: EvaluacionNutricional[]
  ): Array<EvaluacionNutricionalResponde> {
    return evaluaciones.map((evaluacion) => {
      const { archivos } = evaluacion
      return {
        id: evaluacion.id,
        peso: evaluacion.peso,
        talla: evaluacion.talla,
        imc: evaluacion.imc,
        requerimientoCalorico: evaluacion.requerimientoCalorico,
        diagnostico: evaluacion.diagnostico,
        idHistoriaClinica: evaluacion.idHistoriaClinica,
        fechaCreacion: evaluacion.fechaCreacion,
        archivos: archivos.map((archivo) => ({
          id: archivo.id,
          nombreArchivo: archivo.nombreArchivo,
          codigo: archivo.codigo || null,
          tipoArchivo: archivo.tipoArchivo,
          contenidoBase64: archivo.contenidoBase64 || null,
          idHistoriaClinica: archivo.idHistoriaClinica,
          idEvaluacionNutricional: archivo.idEvaluacionNutricional,
        })),
      }
    })
  }
}
