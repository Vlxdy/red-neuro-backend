import { BaseService } from '@/common/base/base-service'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CrearEvaluacionDto } from '../dtos/evaluacion.dto'
import { EvaluacionNutricionalRepository } from '../repositories/evaluacion-nutricional.repository'
import { HistoriaClinicaService } from './historia-clinico.service'
import { CitasService } from '@/application/gestion-pacientes/services/citas.service'
import { CitasEstado } from '@/application/gestion-pacientes/constant'

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
    console.log(citas)
    console.log(historiaClinica)

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
}
