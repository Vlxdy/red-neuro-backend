import { BaseService } from '@/common/base/base-service'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CreateEvaluacionAntropometricaDto } from '../dtos/evaluacion.dto'
import { EvaluacionNutricionalRepository } from '../repositories/evaluacion-nutricional.repository'
import { HistoriaClinicaService } from './historia-clinico.service'
import { CitasService } from '@/application/gestion-pacientes/services/citas.service'
import { CitasEstado } from '@/application/gestion-pacientes/constant'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { EvaluacionNutricional } from '../entities/evaluacion-nutricional.entity'
import { EvaluacionNutricionalResponde } from '@/common/types/data-response.type'
import { HistoriaClinica } from '../entities/historia-clinica.entity'
import dayjs from 'dayjs'

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
    data: CreateEvaluacionAntropometricaDto
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

    const {
      imc,
      masaGrasa,
      masaLibreGrasa,
      relacionCinturaCadera,
      pesoResidual,
    } = this.calcularValoresDerivados(data, historiaClinica)

    const evaluacion = await this.evaluacionNutricionalRepositorio.crear({
      idHistoriaClinica,
      data: {
        ...data,
        imc,
        masaGrasa,
        masaLibreGrasa,
        relacionCinturaCadera,
        pesoResidual,
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
      const formateado: EvaluacionNutricionalResponde = {
        id: evaluacion.id,
        peso: evaluacion.peso,
        pesoObjetivo: evaluacion.pesoObjetivo,
        pesoCompeticion: evaluacion.pesoCompeticion,
        estatura: evaluacion.estatura,
        envergadura: evaluacion.envergadura,
        estaturaSentada: evaluacion.estaturaSentada,
        triceps: evaluacion.triceps,
        subescapular: evaluacion.subescapular,
        biceps: evaluacion.biceps,
        crestaIliaca: evaluacion.crestaIliaca,
        supraEspinal: evaluacion.supraEspinal,
        abdominal: evaluacion.abdominal,
        muslo: evaluacion.muslo,
        relacionCinturaCadera: evaluacion.relacionCinturaCadera,
        pesoResidual: evaluacion.pesoResidual,
        masaGrasa: evaluacion.masaGrasa,
        masaLibreGrasa: evaluacion.masaLibreGrasa,
        estado: evaluacion.estado,
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
      return formateado
    })
  }
  calcularEdad(
    fechaNacimiento: string | Date | undefined | null
  ): number | null {
    if (!fechaNacimiento) return null
    const fecha = dayjs(fechaNacimiento)
    if (!fecha.isValid()) return null
    const hoy = dayjs()
    return hoy.diff(fecha, 'year')
  }
  calcularValoresDerivados(
    dto: CreateEvaluacionAntropometricaDto,
    historiaClinica: HistoriaClinica
  ) {
    const peso = dto.peso
    const talla = dto.estatura
    const cintura = dto.cintura
    const caderas = dto.caderas
    const pesoObjetivo = dto.pesoObjetivo
    const triceps = dto.triceps
    const abdominal = dto.abdominal
    const muslo = dto.muslo
    const edad = this.calcularEdad(
      historiaClinica.paciente.usuario.persona.fechaNacimiento
    )
    const sexo = historiaClinica.paciente.usuario.persona.genero // 'M' o 'F'

    // IMC
    const imc = peso && talla ? +(peso / (talla / 100) ** 2).toFixed(2) : null

    // Relación cintura/cadera
    const relacionCinturaCadera =
      cintura && caderas ? +(cintura / caderas).toFixed(2) : null

    // Peso residual
    const pesoResidual =
      peso && pesoObjetivo ? +(peso - pesoObjetivo).toFixed(2) : null

    // Porcentaje de grasa corporal
    let porcentajeGrasa: number | null = null
    const plieguesValidos = triceps && abdominal && muslo && edad

    if (plieguesValidos && (sexo === 'M' || sexo === 'F')) {
      const suma = triceps + abdominal + muslo

      let densidad: number | null = null
      if (sexo === 'M') {
        densidad =
          1.10938 - 0.0008267 * suma + 0.0000016 * suma ** 2 - 0.0002574 * edad
      } else if (sexo === 'F') {
        densidad =
          1.0994921 -
          0.0009929 * suma +
          0.0000023 * suma ** 2 -
          0.0001392 * edad
      }

      if (densidad) {
        porcentajeGrasa = +(495 / densidad - 450).toFixed(2)
      }
    }

    // Masa grasa
    const masaGrasa =
      peso && porcentajeGrasa
        ? +(peso * (porcentajeGrasa / 100)).toFixed(2)
        : null

    // Masa libre de grasa
    const masaLibreGrasa =
      peso && masaGrasa ? +(peso - masaGrasa).toFixed(2) : null

    return {
      imc,
      relacionCinturaCadera,
      pesoResidual,
      porcentajeGrasa,
      masaGrasa,
      masaLibreGrasa,
    }
  }
}
