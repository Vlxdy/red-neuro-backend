import { BaseService } from '@/common/base'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common'
import { CitasEstado } from './constants'
import {
  ActualizarAgrupadorCitaDto,
  ActualizarCitaDto,
  ActualizarEtiquetasCitaDto,
  ActualizarEstadoCitaDto,
  CancelarCitaDto,
  CrearCitaDto,
  EtiquetaAsociacionDto,
  FiltrosCitaDto,
  FiltrosCitaPaginadoDto,
  ReprogramarCitaDto,
} from './dto/cita.dto'
import { ActualizarEtiquetaDto, CrearEtiquetaDto } from './dto/etiqueta.dto'
import { ActualizarAgrupadorDto, CrearAgrupadorDto } from './dto/agrupador.dto'
import { Etiqueta } from './entities/etiqueta.entity'
import { Agrupador } from './entities/agrupador.entity'
import { Cita } from './entities/cita.entity'
import { CitasMedicasRepository } from './repository/citas-medicas.repository'

export type EtiquetaListado = {
  id: string
  nombre: string
  colorHex: string
  estado: 'ACTIVO' | 'INACTIVO'
}

export type AgrupadorListado = {
  id: string
  nombre: string
  descripcion?: string
  colorHex: string
  estado: 'ACTIVO' | 'INACTIVO'
}

export type CitaListado = {
  id: string
  detalle: string
  fechaInicio: string
  fechaFin: string
  estado: CitasEstado
  medicoId: string
  agrupadorId?: string
  etiquetas: EtiquetaListado[]
  comentario?: string
}

@Injectable()
export class CitasMedicasService extends BaseService {
  constructor(
    @Inject(CitasMedicasRepository)
    private readonly citasRepository: CitasMedicasRepository
  ) {
    super()
  }

  private mapEtiquetaListado(etiqueta: Etiqueta): EtiquetaListado {
    return {
      id: etiqueta.id,
      nombre: etiqueta.nombre,
      colorHex: etiqueta.colorHex,
      estado: etiqueta.estado as 'ACTIVO' | 'INACTIVO',
    }
  }

  private mapAgrupadorListado(agrupador: Agrupador): AgrupadorListado {
    return {
      id: agrupador.id,
      nombre: agrupador.nombre,
      descripcion: agrupador.descripcion ?? undefined,
      colorHex: agrupador.colorHex,
      estado: agrupador.estado as 'ACTIVO' | 'INACTIVO',
    }
  }

  private mapCitaListado(cita: Cita): CitaListado {
    return {
      id: cita.id,
      detalle: cita.detalle,
      fechaInicio: cita.fechaInicio?.toISOString() ?? '',
      fechaFin: cita.fechaFin?.toISOString() ?? '',
      estado: cita.estado as CitasEstado,
      medicoId: cita.idMedico,
      agrupadorId: cita.idAgrupador ?? undefined,
      etiquetas:
        cita.citaEtiquetas?.map((citaEtiqueta) =>
          this.mapEtiquetaListado(citaEtiqueta.etiqueta)
        ) ?? [],
      comentario: cita.comentarioNutricionista ?? undefined,
    }
  }

  private async validarEtiquetaEntrada(
    entrada: EtiquetaAsociacionDto
  ): Promise<void> {
    if (!entrada.id && !entrada.nombre) {
      throw new BadRequestException(
        'Debe especificar id o nombre de la etiqueta'
      )
    }

    if (entrada.nombre && !entrada.id && !entrada.colorHex) {
      const existente = await this.citasRepository.obtenerEtiquetaPorNombre(
        entrada.nombre
      )
      if (!existente) {
        throw new BadRequestException(
          'Para crear una etiqueta nueva se requiere colorHex'
        )
      }
    }
  }

  private async validarEtiquetas(entradas?: EtiquetaAsociacionDto[]) {
    if (!entradas?.length) {
      return
    }

    for (const entrada of entradas) {
      await this.validarEtiquetaEntrada(entrada)
    }
  }

  // ===== Etiquetas =====
  async listarEtiquetas(): Promise<EtiquetaListado[]> {
    const etiquetas = await this.citasRepository.listarEtiquetas()
    return etiquetas.map((etiqueta) => this.mapEtiquetaListado(etiqueta))
  }

  async obtenerEtiqueta(id: string): Promise<EtiquetaListado> {
    const etiqueta = await this.citasRepository.obtenerEtiquetaPorId(id)
    if (!etiqueta) {
      throw new NotFoundException('La etiqueta solicitada no existe')
    }
    return this.mapEtiquetaListado(etiqueta)
  }

  async crearEtiqueta(
    dto: CrearEtiquetaDto,
    usuarioAuditoria = '0'
  ): Promise<EtiquetaListado> {
    const existeNombre = await this.citasRepository.obtenerEtiquetaPorNombre(
      dto.nombre
    )
    if (existeNombre) {
      throw new BadRequestException('Ya existe una etiqueta con ese nombre')
    }
    const creada = await this.citasRepository.crearEtiqueta(
      dto,
      usuarioAuditoria
    )
    return this.mapEtiquetaListado(creada)
  }

  async actualizarEtiqueta(
    id: string,
    dto: ActualizarEtiquetaDto,
    usuarioAuditoria = '0'
  ): Promise<EtiquetaListado> {
    const actualizada = await this.citasRepository.actualizarEtiqueta(
      id,
      dto,
      usuarioAuditoria
    )
    if (!actualizada) {
      throw new NotFoundException('La etiqueta solicitada no existe')
    }
    return this.mapEtiquetaListado(actualizada)
  }

  async eliminarEtiqueta(id: string): Promise<{ id: string }> {
    const etiqueta = await this.citasRepository.obtenerEtiquetaPorId(id)
    if (!etiqueta) {
      throw new NotFoundException('La etiqueta solicitada no existe')
    }
    await this.citasRepository.eliminarEtiqueta(id)
    return { id }
  }

  // ===== Agrupadores =====
  async listarAgrupadores(): Promise<AgrupadorListado[]> {
    const agrupadores = await this.citasRepository.listarAgrupadores()
    return agrupadores.map((agrupador) => this.mapAgrupadorListado(agrupador))
  }

  async obtenerAgrupador(id: string): Promise<AgrupadorListado> {
    const agrupador = await this.citasRepository.obtenerAgrupadorPorId(id)
    if (!agrupador) {
      throw new NotFoundException('El agrupador solicitado no existe')
    }
    return this.mapAgrupadorListado(agrupador)
  }

  async crearAgrupador(
    dto: CrearAgrupadorDto,
    usuarioAuditoria = '0'
  ): Promise<AgrupadorListado> {
    const existeNombre = await this.citasRepository.buscarAgrupadorPorNombre(
      dto.nombre
    )
    if (existeNombre) {
      throw new BadRequestException('Ya existe un agrupador con ese nombre')
    }
    const creado = await this.citasRepository.crearAgrupador(
      dto,
      usuarioAuditoria
    )
    return this.mapAgrupadorListado(creado)
  }

  async actualizarAgrupador(
    id: string,
    dto: ActualizarAgrupadorDto,
    usuarioAuditoria = '0'
  ): Promise<AgrupadorListado> {
    const actualizado = await this.citasRepository.actualizarAgrupador(
      id,
      dto,
      usuarioAuditoria
    )
    if (!actualizado) {
      throw new NotFoundException('El agrupador solicitado no existe')
    }
    return this.mapAgrupadorListado(actualizado)
  }

  async eliminarAgrupador(id: string): Promise<{ id: string }> {
    const agrupador = await this.citasRepository.obtenerAgrupadorPorId(id)
    if (!agrupador) {
      throw new NotFoundException('El agrupador solicitado no existe')
    }
    await this.citasRepository.eliminarAgrupador(id)
    return { id }
  }

  // ===== Citas =====
  async listarCitas(filtros: FiltrosCitaDto): Promise<CitaListado[]> {
    const citas = await this.citasRepository.listarCitas(filtros)
    return citas.map((cita) => this.mapCitaListado(cita))
  }

  async listarCitasPaginadas(
    filtros: FiltrosCitaPaginadoDto
  ): Promise<[CitaListado[], number]> {
    const [citas, total] = await this.citasRepository.listarCitasPaginadas(
      filtros
    )

    return [citas.map((cita) => this.mapCitaListado(cita)), total]
  }

  async listarMisCitas(
    medicoId: string,
    filtros: FiltrosCitaDto
  ): Promise<CitaListado[]> {
    return await this.listarCitas({ ...filtros, medicoId })
  }

  async obtenerCita(id: string): Promise<CitaListado> {
    const cita = await this.citasRepository.obtenerCitaConRelaciones(id)
    if (!cita) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return this.mapCitaListado(cita)
  }

  async crearCita(
    dto: CrearCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    if (dto.agrupadorId) {
      const agrupador = await this.citasRepository.obtenerAgrupadorPorId(
        dto.agrupadorId
      )
      if (!agrupador) {
        throw new NotFoundException('El agrupador solicitado no existe')
      }
    }

    await this.validarEtiquetas(dto.etiquetas)

    const citaId = await this.citasRepository.crearCita(dto, usuarioAuditoria)
    if (!citaId) {
      throw new BadRequestException('No fue posible registrar la cita')
    }

    return await this.obtenerCita(citaId)
  }

  async actualizarCita(
    id: string,
    dto: ActualizarCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    if (dto.agrupadorId) {
      const agrupador = await this.citasRepository.obtenerAgrupadorPorId(
        dto.agrupadorId
      )
      if (!agrupador) {
        throw new NotFoundException('El agrupador solicitado no existe')
      }
    }

    await this.validarEtiquetas(dto.etiquetas)

    const actualizado = await this.citasRepository.actualizarCita(
      id,
      dto,
      usuarioAuditoria
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }

    return await this.obtenerCita(id)
  }

  async actualizarEstadoCita(
    id: string,
    dto: ActualizarEstadoCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    const actualizado = await this.citasRepository.actualizarEstadoCita(
      id,
      dto,
      usuarioAuditoria
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }

  async reprogramarCita(
    id: string,
    dto: ReprogramarCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    const actualizado = await this.citasRepository.reprogramarCita(
      id,
      dto,
      usuarioAuditoria
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }

  async cancelarCita(
    id: string,
    dto: CancelarCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    const actualizado = await this.citasRepository.cancelarCita(
      id,
      dto,
      usuarioAuditoria
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }

  async actualizarEtiquetas(
    id: string,
    dto: ActualizarEtiquetasCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    await this.validarEtiquetas(dto.etiquetas)

    const actualizado = await this.citasRepository.actualizarEtiquetas(
      id,
      dto,
      usuarioAuditoria
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }

  async actualizarAgrupadorCita(
    id: string,
    dto: ActualizarAgrupadorCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    const actualizado = await this.citasRepository.actualizarAgrupadorCita(
      id,
      dto,
      usuarioAuditoria
    )
    if (!actualizado) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return await this.obtenerCita(id)
  }
}
