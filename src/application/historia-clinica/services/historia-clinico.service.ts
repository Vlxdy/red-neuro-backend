import { BaseService } from '@/common/base/base-service'
import { Injectable, PreconditionFailedException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { MedicosService } from '@/application/gestion-pacientes/services/medicos.service'
import { PacientesService } from '@/application/gestion-pacientes/services/pacientes.service'
import { HistoriaClinicaRepository } from '../repositories/historia-clinica.repository'
import { HistoriaClinica } from '../entities/historia-clinica.entity'
import { formatearUsuarioRolRespuesta } from '@/application/gestion-pacientes/utils/formateos'
import { HistoriaClinicaResponse } from '@/common/types/data-response.type'
import { AntecedenteService } from './antecedentes.service'
import { EvaluacionNutricionalService } from './evaluacion-nutricional.service'

@Injectable()
export class HistoriaClinicaService extends BaseService {
  constructor(
    private readonly historiaClinicaRepository: HistoriaClinicaRepository,
    private readonly medicosService: MedicosService,
    private readonly pacienteService: PacientesService,
    private readonly antecedenteService: AntecedenteService,
    private readonly evalucacionesNutricionales: EvaluacionNutricionalService
  ) {
    super()
  }

  async crearHistoriaClinica({
    idMedico,
    idPaciente,
    usuarioAuditoria,
    transaccion,
  }: {
    idMedico: string
    idPaciente: string
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearHistoriaClinica({
          idMedico,
          idPaciente,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }
      return await this.historiaClinicaRepository.runTransaction(op)
    }

    // Verificar si el médico existe
    await this.medicosService.obtenerMedico(idMedico, transaccion)

    // Verificar si la cita existe
    await this.pacienteService.obtenerPaciente(idPaciente, transaccion)

    // Crear el historial médico
    const historiaClinica =
      await this.historiaClinicaRepository.crearHistoriaClinica({
        idMedico,
        idPaciente,
        // data,
        usuarioAuditoria,
        transaccion,
      })

    // const { archivos, evaluacionesNutricionales } = data

    // if (archivos) {
    //   for (const archivo of archivos) {
    //     await this.archivoAdjuntoRepository.crearArchivo({
    //       idHistoriaClinica: historiaClinica.id,
    //       data: archivo,
    //       usuarioAuditoria,
    //       transaccion,
    //     })
    //   }
    // }

    // if (evaluacionesNutricionales) {
    //   for (const evaluacion of evaluacionesNutricionales) {
    //     await this.evaluacionNutricionalService.crearEvaluacion(
    //       historiaClinica.id,
    //       evaluacion,
    //       usuarioAuditoria,
    //       transaccion
    //     )
    //   }
    // }
    return { id: historiaClinica.id }
  }

  async obtenerHistoriaClinica(id: string, transaccion?: EntityManager) {
    const historiaClinica = await this.historiaClinicaRepository.buscarPorId(
      id,
      transaccion
    )
    if (!historiaClinica) {
      throw new Error('Historia clinica no encontrado')
    }
    return historiaClinica
  }

  async obtenerHistoriaClinicaPorPacienteCompleto({
    idPaciente,
    // idMedico,
  }: {
    idPaciente: string
    // TODO: Validar acceso
    // idMedico: string
  }) {
    await this.pacienteService.obtenerPaciente(idPaciente)
    const historiaClinica =
      await this.historiaClinicaRepository.buscarPorPacienteCompleto(
        idPaciente
        // idMedico
      )
    if (!historiaClinica) {
      throw new PreconditionFailedException('Historial médico no encontrado')
    }

    const antecedente =
      await this.antecedenteService.buscarAntecedentePorHistoriaClinica(
        historiaClinica.id
      )

    const ultimaEvaluacion =
      await this.evalucacionesNutricionales.ultimaEvaluacion({
        idHistoriaClinica: historiaClinica.id,
      })
    const historiaClinicaFormateada =
      this.formatearHistoriaClinica(historiaClinica)

    return {
      ...historiaClinicaFormateada,
      antecedente,
      ultimaEvaluacion,
    }
  }

  async buscarPorPaciente(idPaciente: string, transaccion?: EntityManager) {
    const historiaClinica =
      await this.historiaClinicaRepository.buscarPorPaciente(
        idPaciente,
        transaccion
      )
    return historiaClinica
  }

  formatearHistoriaClinica(
    historiaClinica: HistoriaClinica
  ): HistoriaClinicaResponse {
    const { paciente, medico } = historiaClinica
    const historiaClinicaFormateada: HistoriaClinicaResponse = {
      estado: historiaClinica.estado,
      id: historiaClinica.id,
      idMedico: historiaClinica.idMedico,
      idPaciente: historiaClinica.idPaciente,
      observaciones: historiaClinica.observaciones,
      // archivos: await this.archivoAdjuntoRepository.formatearArchivos(archivos),
      // evaluacionNutricional:
      paciente: formatearUsuarioRolRespuesta(paciente),
      medico: medico ? formatearUsuarioRolRespuesta(medico) : undefined,
    }
    return historiaClinicaFormateada
  }
}
