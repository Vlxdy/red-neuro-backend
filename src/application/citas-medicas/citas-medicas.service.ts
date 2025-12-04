import { BaseService } from '@/common/base'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
  ReprogramarCitaDto,
} from './dto/cita.dto'
import { ActualizarEtiquetaDto, CrearEtiquetaDto } from './dto/etiqueta.dto'
import { ActualizarAgrupadorDto, CrearAgrupadorDto } from './dto/agrupador.dto'

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
  private etiquetas: EtiquetaListado[] = []
  private agrupadores: AgrupadorListado[] = []
  private citas: CitaListado[] = []

  constructor() {
    super()
    this.seedDatos()
  }

  private seedDatos() {
    this.etiquetas = [
      {
        id: 'tag-urgente',
        nombre: 'Urgente',
        colorHex: '#ff3366',
        estado: 'ACTIVO',
      },
      {
        id: 'tag-control',
        nombre: 'Control',
        colorHex: '#0ea5e9',
        estado: 'ACTIVO',
      },
    ]
    this.agrupadores = [
      {
        id: 'grp-campana',
        nombre: 'Campaña preventiva',
        descripcion: 'Bloque general de campañas',
        colorHex: '#145d8f',
        estado: 'ACTIVO',
      },
    ]
    this.citas = [
      {
        id: 'cita-001',
        detalle: 'Evaluación inicial',
        fechaInicio: new Date().toISOString(),
        fechaFin: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        estado: CitasEstado.CONFIRMADA,
        medicoId: '42',
        etiquetas: [this.etiquetas[1]],
        agrupadorId: 'grp-campana',
      },
    ]
  }

  private generarId(prefijo: string): string {
    return `${prefijo}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }

  // ===== Etiquetas =====
  listarEtiquetas(): EtiquetaListado[] {
    return this.etiquetas
  }

  obtenerEtiqueta(id: string): EtiquetaListado {
    const etiqueta = this.etiquetas.find((item) => item.id === id)
    if (!etiqueta) {
      throw new NotFoundException('La etiqueta solicitada no existe')
    }
    return etiqueta
  }

  crearEtiqueta(dto: CrearEtiquetaDto): EtiquetaListado {
    const existeNombre = this.etiquetas.some(
      (item) => item.nombre.toLowerCase() === dto.nombre.toLowerCase()
    )
    if (existeNombre) {
      throw new BadRequestException('Ya existe una etiqueta con ese nombre')
    }
    const nueva: EtiquetaListado = {
      ...dto,
      estado: 'ACTIVO',
      id: this.generarId('tag'),
    }
    this.etiquetas.push(nueva)
    return nueva
  }

  actualizarEtiqueta(id: string, dto: ActualizarEtiquetaDto): EtiquetaListado {
    const etiqueta = this.obtenerEtiqueta(id)
    Object.assign(etiqueta, dto)
    return etiqueta
  }

  eliminarEtiqueta(id: string): { id: string } {
    this.obtenerEtiqueta(id)
    this.etiquetas = this.etiquetas.filter((item) => item.id !== id)
    this.citas = this.citas.map((cita) => ({
      ...cita,
      etiquetas: cita.etiquetas.filter((tag) => tag.id !== id),
    }))
    return { id }
  }

  private obtenerEtiquetaPorNombre(
    nombre: string
  ): EtiquetaListado | undefined {
    return this.etiquetas.find(
      (item) => item.nombre.toLowerCase() === nombre.toLowerCase()
    )
  }

  private resolverEtiquetaEntrada(
    entrada: EtiquetaAsociacionDto
  ): EtiquetaListado {
    if (entrada.id) {
      return this.obtenerEtiqueta(entrada.id)
    }

    if (entrada.nombre) {
      const existente = this.obtenerEtiquetaPorNombre(entrada.nombre)
      if (existente) {
        return existente
      }
      if (!entrada.colorHex) {
        throw new BadRequestException(
          'Para crear una etiqueta nueva se requiere colorHex'
        )
      }
      const creada = this.crearEtiqueta({
        nombre: entrada.nombre,
        colorHex: entrada.colorHex,
      })
      return creada
    }

    throw new BadRequestException('Debe especificar id o nombre de la etiqueta')
  }

  private sincronizarEtiquetas(
    entradas: EtiquetaAsociacionDto[]
  ): EtiquetaListado[] {
    const resultado: EtiquetaListado[] = []
    entradas.forEach((entrada) => {
      const etiqueta = this.resolverEtiquetaEntrada(entrada)
      const duplicada = resultado.find((item) => item.id === etiqueta.id)
      if (!duplicada) {
        resultado.push(etiqueta)
      }
    })
    return resultado
  }

  // ===== Agrupadores =====
  listarAgrupadores(): AgrupadorListado[] {
    return this.agrupadores
  }

  obtenerAgrupador(id: string): AgrupadorListado {
    const agrupador = this.agrupadores.find((item) => item.id === id)
    if (!agrupador) {
      throw new NotFoundException('El agrupador solicitado no existe')
    }
    return agrupador
  }

  crearAgrupador(dto: CrearAgrupadorDto): AgrupadorListado {
    const existeNombre = this.agrupadores.some(
      (item) => item.nombre.toLowerCase() === dto.nombre.toLowerCase()
    )
    if (existeNombre) {
      throw new BadRequestException('Ya existe un agrupador con ese nombre')
    }
    const nuevo: AgrupadorListado = {
      ...dto,
      id: this.generarId('grp'),
      estado: 'ACTIVO',
    }
    this.agrupadores.push(nuevo)
    return nuevo
  }

  actualizarAgrupador(
    id: string,
    dto: ActualizarAgrupadorDto
  ): AgrupadorListado {
    const agrupador = this.obtenerAgrupador(id)
    Object.assign(agrupador, dto)
    return agrupador
  }

  eliminarAgrupador(id: string): { id: string } {
    this.obtenerAgrupador(id)
    this.agrupadores = this.agrupadores.filter((item) => item.id !== id)
    this.citas = this.citas.map((cita) => ({
      ...cita,
      agrupadorId: cita.agrupadorId === id ? undefined : cita.agrupadorId,
    }))
    return { id }
  }

  // ===== Citas =====
  listarCitas(filtros: FiltrosCitaDto): CitaListado[] {
    return this.citas.filter((cita) => {
      const fechaInicioOk = filtros.fechaInicio
        ? new Date(cita.fechaInicio) >= new Date(filtros.fechaInicio)
        : true
      const fechaFinOk = filtros.fechaFin
        ? new Date(cita.fechaFin) <= new Date(filtros.fechaFin)
        : true
      const medicoOk = filtros.medicoId
        ? cita.medicoId === filtros.medicoId
        : true
      const estadoOk = filtros.estado ? cita.estado === filtros.estado : true
      const etiquetaOk = filtros.etiquetaId
        ? cita.etiquetas.some((tag) => tag.id === filtros.etiquetaId)
        : true
      const agrupadorOk = filtros.agrupadorId
        ? cita.agrupadorId === filtros.agrupadorId
        : true
      return (
        fechaInicioOk &&
        fechaFinOk &&
        medicoOk &&
        estadoOk &&
        etiquetaOk &&
        agrupadorOk
      )
    })
  }

  listarMisCitas(medicoId: string, filtros: FiltrosCitaDto): CitaListado[] {
    return this.listarCitas({ ...filtros, medicoId })
  }

  obtenerCita(id: string): CitaListado {
    const cita = this.citas.find((item) => item.id === id)
    if (!cita) {
      throw new NotFoundException('La cita solicitada no existe')
    }
    return cita
  }

  crearCita(dto: CrearCitaDto): CitaListado {
    const etiquetas = dto.etiquetas
      ? this.sincronizarEtiquetas(dto.etiquetas)
      : []
    if (dto.agrupadorId) {
      this.obtenerAgrupador(dto.agrupadorId)
    }
    const cita: CitaListado = {
      ...dto,
      id: this.generarId('cita'),
      estado: CitasEstado.BORRADOR,
      etiquetas,
    }
    this.citas.push(cita)
    return cita
  }

  actualizarCita(id: string, dto: ActualizarCitaDto): CitaListado {
    const cita = this.obtenerCita(id)
    if (dto.etiquetas) {
      cita.etiquetas = this.sincronizarEtiquetas(dto.etiquetas)
    }
    Object.assign(cita, { ...dto, etiquetas: cita.etiquetas })
    return cita
  }

  actualizarEstadoCita(id: string, dto: ActualizarEstadoCitaDto): CitaListado {
    const cita = this.obtenerCita(id)
    cita.estado = dto.estado
    cita.comentario = dto.comentario
    return cita
  }

  reprogramarCita(id: string, dto: ReprogramarCitaDto): CitaListado {
    const cita = this.obtenerCita(id)
    cita.fechaInicio = dto.fechaInicio
    cita.fechaFin = dto.fechaFin
    cita.comentario = dto.comentario
    cita.estado =
      CitasEstado.RECHAZADA === cita.estado
        ? CitasEstado.SOLICITADA
        : cita.estado
    return cita
  }

  cancelarCita(id: string, dto: CancelarCitaDto): CitaListado {
    const cita = this.obtenerCita(id)
    cita.estado = CitasEstado.CANCELADA
    cita.comentario = dto.comentario
    return cita
  }

  actualizarEtiquetas(
    id: string,
    dto: ActualizarEtiquetasCitaDto
  ): CitaListado {
    const cita = this.obtenerCita(id)
    cita.etiquetas = this.sincronizarEtiquetas(dto.etiquetas)
    return cita
  }

  actualizarAgrupador(
    id: string,
    dto: ActualizarAgrupadorCitaDto
  ): CitaListado {
    const cita = this.obtenerCita(id)
    this.obtenerAgrupador(dto.agrupadorId)
    cita.agrupadorId = dto.agrupadorId
    return cita
  }
}
