import { BaseService } from '@/common/base'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm'
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
import { CitaEtiqueta } from './entities/cita-etiqueta.entity'

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
  constructor(private readonly dataSource: DataSource) {
    super()
  }

  private etiquetaRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Etiqueta)
  }

  private agrupadorRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Agrupador)
  }

  private citaRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Cita)
  }

  private citaEtiquetaRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(CitaEtiqueta)
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

  private buildCitasQuery(
    filtros: FiltrosCitaDto | FiltrosCitaPaginadoDto,
    manager?: EntityManager
  ): SelectQueryBuilder<Cita> {
    const query = this.citaRepository(manager)
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.citaEtiquetas', 'citaEtiqueta')
      .leftJoinAndSelect('citaEtiqueta.etiqueta', 'etiqueta')
      .leftJoinAndSelect('cita.agrupador', 'agrupador')
      .distinct(true)

    if (filtros.fechaInicio) {
      query.andWhere('cita.fechaInicio >= :fechaInicio', {
        fechaInicio: filtros.fechaInicio,
      })
    }

    if (filtros.fechaFin) {
      query.andWhere('cita.fechaFin <= :fechaFin', {
        fechaFin: filtros.fechaFin,
      })
    }

    if (filtros.medicoId) {
      query.andWhere('cita.idMedico = :medicoId', {
        medicoId: filtros.medicoId,
      })
    }

    if (filtros.estado) {
      query.andWhere('cita.estado = :estado', {
        estado: filtros.estado,
      })
    }

    if (filtros.etiquetaId) {
      query.andWhere('citaEtiqueta.etiquetaId = :etiquetaId', {
        etiquetaId: filtros.etiquetaId,
      })
    }

    if (filtros.agrupadorId) {
      query.andWhere('cita.idAgrupador = :agrupadorId', {
        agrupadorId: filtros.agrupadorId,
      })
    }

    return query
  }

  private async obtenerEtiquetaPorNombre(
    nombre: string,
    manager?: EntityManager
  ): Promise<Etiqueta | null> {
    return await this.etiquetaRepository(manager)
      .createQueryBuilder('etiqueta')
      .where('LOWER(etiqueta.nombre) = LOWER(:nombre)', { nombre })
      .getOne()
  }

  private async obtenerEtiquetaPorId(
    id: string,
    manager?: EntityManager
  ): Promise<Etiqueta> {
    const etiqueta = await this.etiquetaRepository(manager).findOne({
      where: { id },
    })
    if (!etiqueta) {
      throw new NotFoundException('La etiqueta solicitada no existe')
    }
    return etiqueta
  }

  private async obtenerAgrupadorPorId(
    id: string,
    manager?: EntityManager
  ): Promise<Agrupador> {
    const agrupador = await this.agrupadorRepository(manager).findOne({
      where: { id },
    })
    if (!agrupador) {
      throw new NotFoundException('El agrupador solicitado no existe')
    }
    return agrupador
  }

  private async resolverEtiquetaEntrada(
    entrada: EtiquetaAsociacionDto,
    usuarioAuditoria: string,
    manager?: EntityManager
  ): Promise<Etiqueta> {
    if (entrada.id) {
      return this.obtenerEtiquetaPorId(entrada.id, manager)
    }

    if (entrada.nombre) {
      const existente = await this.obtenerEtiquetaPorNombre(
        entrada.nombre,
        manager
      )
      if (existente) {
        return existente
      }
      if (!entrada.colorHex) {
        throw new BadRequestException(
          'Para crear una etiqueta nueva se requiere colorHex'
        )
      }
      const creada = this.etiquetaRepository(manager).create({
        nombre: entrada.nombre,
        colorHex: entrada.colorHex,
        usuarioCreacion: usuarioAuditoria,
      })
      return await this.etiquetaRepository(manager).save(creada)
    }

    throw new BadRequestException('Debe especificar id o nombre de la etiqueta')
  }

  private async sincronizarEtiquetas(
    entradas: EtiquetaAsociacionDto[],
    usuarioAuditoria: string,
    manager?: EntityManager
  ): Promise<Etiqueta[]> {
    const resultado: Etiqueta[] = []

    for (const entrada of entradas) {
      const etiqueta = await this.resolverEtiquetaEntrada(
        entrada,
        usuarioAuditoria,
        manager
      )
      const duplicada = resultado.find((item) => item.id === etiqueta.id)
      if (!duplicada) {
        resultado.push(etiqueta)
      }
    }

    return resultado
  }

  private async obtenerCitaConRelaciones(
    id: string,
    manager?: EntityManager
  ): Promise<Cita> {
    const cita = await this.buildCitasQuery({}, manager)
      .andWhere('cita.id = :id', { id })
      .getOne()

    if (!cita) {
      throw new NotFoundException('La cita solicitada no existe')
    }

    return cita
  }

  // ===== Etiquetas =====
  async listarEtiquetas(): Promise<EtiquetaListado[]> {
    const etiquetas = await this.etiquetaRepository().find({
      order: { nombre: 'ASC' },
    })
    return etiquetas.map((etiqueta) => this.mapEtiquetaListado(etiqueta))
  }

  async obtenerEtiqueta(id: string): Promise<EtiquetaListado> {
    const etiqueta = await this.obtenerEtiquetaPorId(id)
    return this.mapEtiquetaListado(etiqueta)
  }

  async crearEtiqueta(
    dto: CrearEtiquetaDto,
    usuarioAuditoria = '0'
  ): Promise<EtiquetaListado> {
    const existeNombre = await this.obtenerEtiquetaPorNombre(dto.nombre)
    if (existeNombre) {
      throw new BadRequestException('Ya existe una etiqueta con ese nombre')
    }
    const nueva = this.etiquetaRepository().create({
      ...dto,
      usuarioCreacion: usuarioAuditoria,
    })
    const creada = await this.etiquetaRepository().save(nueva)
    return this.mapEtiquetaListado(creada)
  }

  async actualizarEtiqueta(
    id: string,
    dto: ActualizarEtiquetaDto,
    usuarioAuditoria = '0'
  ): Promise<EtiquetaListado> {
    const etiqueta = await this.obtenerEtiquetaPorId(id)
    Object.assign(etiqueta, {
      ...dto,
      usuarioModificacion: usuarioAuditoria,
    })
    const actualizada = await this.etiquetaRepository().save(etiqueta)
    return this.mapEtiquetaListado(actualizada)
  }

  async eliminarEtiqueta(id: string): Promise<{ id: string }> {
    await this.obtenerEtiquetaPorId(id)
    await this.etiquetaRepository().delete(id)
    return { id }
  }

  // ===== Agrupadores =====
  async listarAgrupadores(): Promise<AgrupadorListado[]> {
    const agrupadores = await this.agrupadorRepository().find({
      order: { nombre: 'ASC' },
    })
    return agrupadores.map((agrupador) => this.mapAgrupadorListado(agrupador))
  }

  async obtenerAgrupador(id: string): Promise<AgrupadorListado> {
    const agrupador = await this.obtenerAgrupadorPorId(id)
    return this.mapAgrupadorListado(agrupador)
  }

  async crearAgrupador(
    dto: CrearAgrupadorDto,
    usuarioAuditoria = '0'
  ): Promise<AgrupadorListado> {
    const existeNombre = await this.agrupadorRepository()
      .createQueryBuilder('agrupador')
      .where('LOWER(agrupador.nombre) = LOWER(:nombre)', {
        nombre: dto.nombre,
      })
      .getOne()

    if (existeNombre) {
      throw new BadRequestException('Ya existe un agrupador con ese nombre')
    }
    const nuevo = this.agrupadorRepository().create({
      ...dto,
      usuarioCreacion: usuarioAuditoria,
    })
    const creado = await this.agrupadorRepository().save(nuevo)
    return this.mapAgrupadorListado(creado)
  }

  async actualizarAgrupador(
    id: string,
    dto: ActualizarAgrupadorDto,
    usuarioAuditoria = '0'
  ): Promise<AgrupadorListado> {
    const agrupador = await this.obtenerAgrupadorPorId(id)
    Object.assign(agrupador, {
      ...dto,
      usuarioModificacion: usuarioAuditoria,
    })
    const actualizado = await this.agrupadorRepository().save(agrupador)
    return this.mapAgrupadorListado(actualizado)
  }

  async eliminarAgrupador(id: string): Promise<{ id: string }> {
    await this.obtenerAgrupadorPorId(id)
    await this.agrupadorRepository().delete(id)
    return { id }
  }

  // ===== Citas =====
  async listarCitas(filtros: FiltrosCitaDto): Promise<CitaListado[]> {
    const citas = await this.buildCitasQuery(filtros).getMany()
    return citas.map((cita) => this.mapCitaListado(cita))
  }

  async listarCitasPaginadas(
    filtros: FiltrosCitaPaginadoDto
  ): Promise<[CitaListado[], number]> {
    const { limite, saltar } = filtros
    const [citas, total] = await this.buildCitasQuery(filtros)
      .take(limite)
      .skip(saltar)
      .getManyAndCount()

    return [citas.map((cita) => this.mapCitaListado(cita)), total]
  }

  async listarMisCitas(
    medicoId: string,
    filtros: FiltrosCitaDto
  ): Promise<CitaListado[]> {
    return await this.listarCitas({ ...filtros, medicoId })
  }

  async obtenerCita(id: string): Promise<CitaListado> {
    const cita = await this.obtenerCitaConRelaciones(id)
    return this.mapCitaListado(cita)
  }

  async crearCita(
    dto: CrearCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    const citaId = await this.dataSource.transaction(async (manager) => {
      if (dto.agrupadorId) {
        await this.obtenerAgrupadorPorId(dto.agrupadorId, manager)
      }

      const etiquetas = dto.etiquetas
        ? await this.sincronizarEtiquetas(
            dto.etiquetas,
            usuarioAuditoria,
            manager
          )
        : []

      const cita = this.citaRepository(manager).create({
        detalle: dto.detalle,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: new Date(dto.fechaFin),
        idMedico: dto.medicoId,
        idAgrupador: dto.agrupadorId ?? null,
        estado: CitasEstado.BORRADOR,
        usuarioCreacion: usuarioAuditoria,
      })

      const guardada = await this.citaRepository(manager).save(cita)

      if (etiquetas.length) {
        const relaciones = etiquetas.map((etiqueta) =>
          this.citaEtiquetaRepository(manager).create({
            citaId: guardada.id,
            etiquetaId: etiqueta.id,
            usuarioCreacion: usuarioAuditoria,
          })
        )
        await this.citaEtiquetaRepository(manager).save(relaciones)
      }

      return guardada.id
    })

    return await this.obtenerCita(citaId)
  }

  async actualizarCita(
    id: string,
    dto: ActualizarCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)

      if (dto.agrupadorId) {
        await this.obtenerAgrupadorPorId(dto.agrupadorId, manager)
      }

      Object.assign(cita, {
        detalle: dto.detalle ?? cita.detalle,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : cita.fechaInicio,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : cita.fechaFin,
        idMedico: dto.medicoId ?? cita.idMedico,
        idAgrupador:
          dto.agrupadorId !== undefined ? dto.agrupadorId : cita.idAgrupador,
        usuarioModificacion: usuarioAuditoria,
      })

      await this.citaRepository(manager).save(cita)

      if (dto.etiquetas) {
        await this.citaEtiquetaRepository(manager).delete({ citaId: id })
        const etiquetas = await this.sincronizarEtiquetas(
          dto.etiquetas,
          usuarioAuditoria,
          manager
        )
        if (etiquetas.length) {
          const relaciones = etiquetas.map((etiqueta) =>
            this.citaEtiquetaRepository(manager).create({
              citaId: id,
              etiquetaId: etiqueta.id,
              usuarioCreacion: usuarioAuditoria,
            })
          )
          await this.citaEtiquetaRepository(manager).save(relaciones)
        }
      }
    })

    return await this.obtenerCita(id)
  }

  async actualizarEstadoCita(
    id: string,
    dto: ActualizarEstadoCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    const cita = await this.obtenerCitaConRelaciones(id)
    cita.estado = dto.estado
    cita.comentarioNutricionista = dto.comentario
    cita.usuarioModificacion = usuarioAuditoria
    await this.citaRepository().save(cita)
    return this.mapCitaListado(cita)
  }

  async reprogramarCita(
    id: string,
    dto: ReprogramarCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    const cita = await this.obtenerCitaConRelaciones(id)
    cita.fechaInicio = new Date(dto.fechaInicio)
    cita.fechaFin = new Date(dto.fechaFin)
    cita.comentarioNutricionista = dto.comentario
    cita.estado =
      CitasEstado.RECHAZADA === cita.estado
        ? CitasEstado.SOLICITADA
        : (cita.estado as CitasEstado)
    cita.usuarioModificacion = usuarioAuditoria
    await this.citaRepository().save(cita)
    return this.mapCitaListado(cita)
  }

  async cancelarCita(
    id: string,
    dto: CancelarCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    const cita = await this.obtenerCitaConRelaciones(id)
    cita.estado = CitasEstado.CANCELADA
    cita.comentarioNutricionista = dto.comentario
    cita.usuarioModificacion = usuarioAuditoria
    await this.citaRepository().save(cita)
    return this.mapCitaListado(cita)
  }

  async actualizarEtiquetas(
    id: string,
    dto: ActualizarEtiquetasCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    await this.dataSource.transaction(async (manager) => {
      await this.obtenerCitaConRelaciones(id, manager)
      await this.citaEtiquetaRepository(manager).delete({ citaId: id })
      const etiquetas = await this.sincronizarEtiquetas(
        dto.etiquetas,
        usuarioAuditoria,
        manager
      )
      if (etiquetas.length) {
        const relaciones = etiquetas.map((etiqueta) =>
          this.citaEtiquetaRepository(manager).create({
            citaId: id,
            etiquetaId: etiqueta.id,
            usuarioCreacion: usuarioAuditoria,
          })
        )
        await this.citaEtiquetaRepository(manager).save(relaciones)
      }
    })

    return await this.obtenerCita(id)
  }

  async actualizarAgrupadorCita(
    id: string,
    dto: ActualizarAgrupadorCitaDto,
    usuarioAuditoria = '0'
  ): Promise<CitaListado> {
    await this.obtenerAgrupadorPorId(dto.agrupadorId)
    const cita = await this.obtenerCitaConRelaciones(id)
    cita.idAgrupador = dto.agrupadorId
    cita.usuarioModificacion = usuarioAuditoria
    await this.citaRepository().save(cita)
    return this.mapCitaListado(cita)
  }
}
