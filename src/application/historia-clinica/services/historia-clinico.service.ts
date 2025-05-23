import { BaseService } from '@/common/base/base-service'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CrearHistoriaClinicaDto } from '../dtos/historia-clinica.dto'
import { MedicosService } from '@/application/gestion-pacientes/services/medicos.service'
import { PacientesService } from '@/application/gestion-pacientes/services/pacientes.service'
import { ArchivoAdjuntoService } from './archivo-adjunto.service'
import { EvaluacionNutricionalService } from './evaluacion-nutricional.service'
import { HistoriaClinicaRepository } from '../repositories/historia-clinica.repository'

@Injectable()
export class HistoriaClinicaService extends BaseService {
  constructor(
    private readonly historiaClinicaRepository: HistoriaClinicaRepository,
    private readonly medicosService: MedicosService,
    private readonly pacienteService: PacientesService,
    private readonly archivoAdjuntoRepository: ArchivoAdjuntoService,
    private readonly evaluacionNutricionalService: EvaluacionNutricionalService
  ) {
    super()
  }

  async crearHistoriaClinica({
    idMedico,
    idCita,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idMedico: string
    idCita: string
    data: CrearHistoriaClinicaDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearHistoriaClinica({
          idMedico,
          idCita,
          data,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }
      return await this.historiaClinicaRepository.runTransaction(op)
    }

    // Verificar si el médico existe
    await this.medicosService.obtenerMedico(idMedico, transaccion)

    // Verificar si la cita existe
    await this.pacienteService.obtenerPaciente(data.idPaciente, transaccion)

    // Crear el historial médico
    const historiaClinica =
      await this.historiaClinicaRepository.crearHistoriaClinica({
        idMedico,

        data,
        usuarioAuditoria,
        transaccion,
      })

    const { archivos, evaluacionesNutricionales } = data

    if (archivos) {
      for (const archivo of archivos) {
        await this.archivoAdjuntoRepository.crearArchivo({
          idHistoriaClinica: historiaClinica.id,
          data: archivo,
          usuarioAuditoria,
          transaccion,
        })
      }
    }

    if (evaluacionesNutricionales) {
      for (const evaluacion of evaluacionesNutricionales) {
        await this.evaluacionNutricionalService.crearEvaluacion(
          historiaClinica.id,
          evaluacion,
          usuarioAuditoria,
          transaccion
        )
      }
    }
  }

  async obtenerHistoriaClinica(id: string, transaccion?: EntityManager) {
    const historiaClinica = await this.historiaClinicaRepository.buscarPorId(
      id,
      transaccion
    )
    if (!historiaClinica) {
      throw new Error('Historial médico no encontrado')
    }
    return historiaClinica
  }
}
