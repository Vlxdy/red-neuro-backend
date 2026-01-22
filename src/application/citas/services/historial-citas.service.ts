import { BaseService } from '@/common/base'
import { Inject, Injectable } from '@nestjs/common'
import {
  FiltrosHistorialCitaPaginadoDto,
  HistorialCitaResponseDto,
} from '../dto/cita.dto'
import { HistorialCitasRepository } from '../repository/historial-citas.repository'
import { CitasMedicasService } from './citas-medicas.service'
import { formatearHistorialCitas } from '../utils/formatear-historial'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { formatearPersonal } from '@/application/personal/utils/formateo-personal.utils'
import { formatearPaciente } from '@/application/paciente/utils/formateo-paciente'
import { TipoActualizacion } from '../entities/notificacion.entity'
import { HistorialCita } from '../entities/cita-historial.entity'

@Injectable()
export class HistorialCitasService extends BaseService {
  constructor(
    @Inject(HistorialCitasRepository)
    private readonly historialRepository: HistorialCitasRepository,
    private readonly citasService: CitasMedicasService
  ) {
    super()
  }

  async listarHistorialCita(
    id: string,
    filtros: FiltrosHistorialCitaPaginadoDto
  ): Promise<[HistorialCitaResponseDto[], number]> {
    await this.citasService.obtenerCitaId(id)
    const [historial, total] =
      await this.historialRepository.listarHistorialCitaPaginado(id, filtros)
    const ejecutoresIds = Array.from(
      new Set(historial.map((item) => item.idEjecutor))
    )
    const ejecutores: UsuarioRol[] =
      await this.historialRepository.obtenerUsuariosRolPorIds(ejecutoresIds)
    const ejecutoresMap = new Map(
      ejecutores.map((ejecutor) => [ejecutor.id, formatearPersonal(ejecutor)])
    )
    const { medicoIds, pacienteIds } = this.obtenerIdsRelacionados(historial)
    const medicos =
      await this.historialRepository.obtenerUsuariosRolPorIds(medicoIds)
    const pacientes =
      await this.historialRepository.obtenerPacientesPorIds(pacienteIds)
    const medicosMap = new Map(
      medicos.map((medico) => [medico.id, formatearPersonal(medico)])
    )
    const pacientesMap = new Map(
      pacientes.map((paciente) => [paciente.id, formatearPaciente(paciente)])
    )
    return [
      formatearHistorialCitas(
        historial,
        ejecutoresMap,
        medicosMap,
        pacientesMap
      ),
      total,
    ]
  }

  private obtenerIdsRelacionados(historial: HistorialCita[]) {
    const medicoIds = new Set<string>()
    const pacienteIds = new Set<string>()

    historial.forEach((item) => {
      this.extraerIdsDesdeDetalle(item.detalleCambios, medicoIds, pacienteIds)
    })

    return {
      medicoIds: Array.from(medicoIds),
      pacienteIds: Array.from(pacienteIds),
    }
  }

  private extraerIdsDesdeDetalle(
    detalle?: TipoActualizacion[],
    medicoIds?: Set<string>,
    pacienteIds?: Set<string>
  ) {
    if (!detalle?.length) {
      return
    }

    detalle.forEach((cambio) => {
      if (cambio.field === 'idMedico') {
        if (cambio.before) {
          medicoIds?.add(cambio.before)
        }
        if (cambio.after) {
          medicoIds?.add(cambio.after)
        }
      }

      if (cambio.field === 'idPaciente') {
        if (cambio.before) {
          pacienteIds?.add(cambio.before)
        }
        if (cambio.after) {
          pacienteIds?.add(cambio.after)
        }
      }
    })
  }
}
