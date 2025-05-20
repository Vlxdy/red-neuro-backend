import { BaseService } from '@/common/base/base-service'
import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CrearHistorialMedicoDto } from '../dtos/historial-medico.dto'
import { HistorialMedicoRepository } from '../repositories/historial-medico.repository'
import { MedicosService } from '@/application/gestion-pacientes/services/medicos.service'
import { PacientesService } from '@/application/gestion-pacientes/services/pacientes.service'
import { ArchivoAdjuntoService } from './archivo-adjunto.service'
import { EvaluacionNutricionalService } from './evaluacion-nutricional.service'

@Injectable()
export class HistorialMedicoService extends BaseService {
  constructor(
    private readonly historialMedicoRepository: HistorialMedicoRepository,
    private readonly medicosService: MedicosService,
    private readonly pacienteService: PacientesService,
    private readonly archivoAdjuntoRepository: ArchivoAdjuntoService,
    private readonly evaluacionNutricionalService: EvaluacionNutricionalService
  ) {
    super()
  }

  async crearHistorialMedico({
    idMedico,
    idCita,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idMedico: string
    idCita: string
    data: CrearHistorialMedicoDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearHistorialMedico({
          idMedico,
          idCita,
          data,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }
      return await this.historialMedicoRepository.runTransaction(op)
    }

    // Verificar si el médico existe
    await this.medicosService.obtenerMedico(idMedico, transaccion)

    // Verificar si la cita existe
    await this.pacienteService.obtenerPaciente(data.idPaciente, transaccion)

    // Crear el historial médico
    const historialMedico =
      await this.historialMedicoRepository.crearHistorialMedico({
        idMedico,

        data,
        usuarioAuditoria,
        transaccion,
      })

    const { archivos, evaluacionesNutricionales } = data

    if (archivos) {
      for (const archivo of archivos) {
        await this.archivoAdjuntoRepository.crearArchivo({
          idHistoriaClinica: historialMedico.id,
          data: archivo,
          usuarioAuditoria,
          transaccion,
        })
      }
    }

    if (evaluacionesNutricionales) {
      for (const evaluacion of evaluacionesNutricionales) {
        await this.evaluacionNutricionalService.crearEvaluacion(
          historialMedico.id,
          evaluacion,
          usuarioAuditoria,
          transaccion
        )
      }
    }
  }

  async obtenerHistorialMedico(id: string, transaccion?: EntityManager) {
    const historialMedico = await this.historialMedicoRepository.buscarPorId(
      id,
      transaccion
    )
    if (!historialMedico) {
      throw new Error('Historial médico no encontrado')
    }
    return historialMedico
  }
}
