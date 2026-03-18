import { BaseService } from '@/common/base'
import { Inject, Injectable } from '@nestjs/common'
import {
  FiltrosHistorialCitaPaginadoDto,
  HistorialCitaResponseDto,
} from '../dto/cita.dto'
import { HistorialCitasRepository } from '../repository/historial-citas.repository'
import { CitasMedicasService } from './citas-medicas.service'
import { formatearHistorialCitas } from '../utils/formatear-historial'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { formatearUsuarioComoPersonal } from '@/application/personal/utils/formateo-personal.utils'
import { formatearPaciente } from '@/application/paciente/utils/formateo-paciente'
import { TipoActualizacion } from '../entities/notificacion.entity'
import { HistorialCita } from '../entities/cita-historial.entity'
import { formatearServicio } from '../utils/formatear-citas'

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
    const ejecutores: Usuario[] =
      await this.historialRepository.obtenerUsuariosPorIds(ejecutoresIds)
    const ejecutoresMap = new Map(
      ejecutores.map((ejecutor) => [
        ejecutor.id,
        formatearUsuarioComoPersonal(ejecutor),
      ])
    )
    const { idPersonals, pacienteIds, servicioIds } =
      this.obtenerIdsRelacionados(historial)
    const personals =
      await this.historialRepository.obtenerUsuariosPorIds(idPersonals)
    const pacientes =
      await this.historialRepository.obtenerPacientesPorIds(pacienteIds)
    const servicios =
      await this.historialRepository.obtenerServiciosPorIds(servicioIds)
    const personalsMap = new Map(
      personals.map((personal) => [
        personal.id,
        formatearUsuarioComoPersonal(personal),
      ])
    )
    const pacientesMap = new Map(
      pacientes.map((paciente) => [paciente.id, formatearPaciente(paciente)])
    )
    const serviciosMap = new Map(
      servicios.map((servicio) => [servicio.id, formatearServicio(servicio)])
    )
    return [
      formatearHistorialCitas(
        historial,
        ejecutoresMap,
        personalsMap,
        pacientesMap,
        serviciosMap
      ),
      total,
    ]
  }

  private obtenerIdsRelacionados(historial: HistorialCita[]) {
    const idPersonals = new Set<string>()
    const pacienteIds = new Set<string>()
    const servicioIds = new Set<string>()

    historial.forEach((item) => {
      this.extraerIdsDesdeDetalle(
        item.detalleCambios ?? undefined,
        idPersonals,
        pacienteIds,
        servicioIds
      )
    })

    return {
      idPersonals: Array.from(idPersonals),
      pacienteIds: Array.from(pacienteIds),
      servicioIds: Array.from(servicioIds),
    }
  }

  private extraerIdsDesdeDetalle(
    detalle?: TipoActualizacion[],
    idPersonals?: Set<string>,
    pacienteIds?: Set<string>,
    servicioIds?: Set<string>
  ) {
    if (!detalle?.length) {
      return
    }

    detalle.forEach((cambio) => {
      if (cambio.field === 'idPersonal') {
        if (cambio.before) {
          idPersonals?.add(cambio.before)
        }
        if (cambio.after) {
          idPersonals?.add(cambio.after)
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

      if (cambio.field === 'idServicio') {
        if (cambio.before) {
          servicioIds?.add(cambio.before)
        }
        if (cambio.after) {
          servicioIds?.add(cambio.after)
        }
      }
    })
  }
}
