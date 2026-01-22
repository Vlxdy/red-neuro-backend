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
    const ejecutoresUnicos = Array.from(
      new Map(
        historial.map((item) => [
          `${item.idEjecutor}-${item.rolEjecutor}`,
          { idUsuario: item.idEjecutor, idRol: item.rolEjecutor },
        ])
      ).values()
    )
    const ejecutores: UsuarioRol[] =
      await this.historialRepository.obtenerEjecutoresHistorial(
        ejecutoresUnicos
      )
    const ejecutoresMap = new Map(
      ejecutores.map((ejecutor) => [
        `${ejecutor.idUsuario}-${ejecutor.idRol}`,
        formatearPersonal(ejecutor),
      ])
    )
    return [formatearHistorialCitas(historial, ejecutoresMap), total]
  }
}
