import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm'
import { Cita } from '../entities/cita.entity'
import { Etiqueta } from '../entities/etiqueta.entity'
import { Agrupador } from '../entities/agrupador.entity'
import { CitaEtiqueta } from '../entities/cita-etiqueta.entity'
import { CitasEstado } from '../constants'
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
} from '../dto/cita.dto'
import { ActualizarEtiquetaDto, CrearEtiquetaDto } from '../dto/etiqueta.dto'
import { ActualizarAgrupadorDto, CrearAgrupadorDto } from '../dto/agrupador.dto'

@Injectable()
export class CitasMedicasRepository {
  constructor(private readonly dataSource: DataSource) {}

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

  buildCitasQuery(
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

  async listarEtiquetas() {
    return await this.etiquetaRepository().find({
      order: { nombre: 'ASC' },
    })
  }

  async obtenerEtiquetaPorId(id: string, manager?: EntityManager) {
    return await this.etiquetaRepository(manager).findOne({ where: { id } })
  }

  async obtenerEtiquetaPorNombre(nombre: string, manager?: EntityManager) {
    return await this.etiquetaRepository(manager)
      .createQueryBuilder('etiqueta')
      .where('LOWER(etiqueta.nombre) = LOWER(:nombre)', { nombre })
      .getOne()
  }

  async crearEtiqueta(dto: CrearEtiquetaDto, usuarioAuditoria: string) {
    return await this.dataSource.transaction(async (manager) => {
      const nueva = this.etiquetaRepository(manager).create({
        ...dto,
        usuarioCreacion: usuarioAuditoria,
      })
      return await this.etiquetaRepository(manager).save(nueva)
    })
  }

  async actualizarEtiqueta(
    id: string,
    dto: ActualizarEtiquetaDto,
    usuarioAuditoria: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const etiqueta = await this.obtenerEtiquetaPorId(id, manager)
      if (!etiqueta) {
        return null
      }
      Object.assign(etiqueta, {
        ...dto,
        usuarioModificacion: usuarioAuditoria,
      })
      return await this.etiquetaRepository(manager).save(etiqueta)
    })
  }

  async eliminarEtiqueta(id: string) {
    await this.etiquetaRepository().delete(id)
  }

  async listarAgrupadores() {
    return await this.agrupadorRepository().find({
      order: { nombre: 'ASC' },
    })
  }

  async obtenerAgrupadorPorId(id: string, manager?: EntityManager) {
    return await this.agrupadorRepository(manager).findOne({ where: { id } })
  }

  async buscarAgrupadorPorNombre(nombre: string) {
    return await this.agrupadorRepository()
      .createQueryBuilder('agrupador')
      .where('LOWER(agrupador.nombre) = LOWER(:nombre)', { nombre })
      .getOne()
  }

  async crearAgrupador(dto: CrearAgrupadorDto, usuarioAuditoria: string) {
    return await this.dataSource.transaction(async (manager) => {
      const nuevo = this.agrupadorRepository(manager).create({
        ...dto,
        usuarioCreacion: usuarioAuditoria,
      })
      return await this.agrupadorRepository(manager).save(nuevo)
    })
  }

  async actualizarAgrupador(
    id: string,
    dto: ActualizarAgrupadorDto,
    usuarioAuditoria: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const agrupador = await this.obtenerAgrupadorPorId(id, manager)
      if (!agrupador) {
        return null
      }
      Object.assign(agrupador, {
        ...dto,
        usuarioModificacion: usuarioAuditoria,
      })
      return await this.agrupadorRepository(manager).save(agrupador)
    })
  }

  async eliminarAgrupador(id: string) {
    await this.agrupadorRepository().delete(id)
  }

  async listarCitas(filtros: FiltrosCitaDto) {
    return await this.buildCitasQuery(filtros).getMany()
  }

  async listarCitasPaginadas(filtros: FiltrosCitaPaginadoDto) {
    const { limite, saltar } = filtros
    return await this.buildCitasQuery(filtros)
      .take(limite)
      .skip(saltar)
      .getManyAndCount()
  }

  async obtenerCitaConRelaciones(id: string, manager?: EntityManager) {
    return await this.buildCitasQuery({}, manager)
      .andWhere('cita.id = :id', { id })
      .getOne()
  }

  private async resolverEtiquetaEntrada(
    entrada: EtiquetaAsociacionDto,
    usuarioAuditoria: string,
    manager: EntityManager
  ) {
    if (entrada.id) {
      return await this.obtenerEtiquetaPorId(entrada.id, manager)
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
        return null
      }
      const creada = this.etiquetaRepository(manager).create({
        nombre: entrada.nombre,
        colorHex: entrada.colorHex,
        usuarioCreacion: usuarioAuditoria,
      })
      return await this.etiquetaRepository(manager).save(creada)
    }

    return null
  }

  private async sincronizarEtiquetas(
    entradas: EtiquetaAsociacionDto[],
    usuarioAuditoria: string,
    manager: EntityManager
  ) {
    const resultado: Etiqueta[] = []

    for (const entrada of entradas) {
      const etiqueta = await this.resolverEtiquetaEntrada(
        entrada,
        usuarioAuditoria,
        manager
      )
      if (!etiqueta) {
        continue
      }
      const duplicada = resultado.find((item) => item.id === etiqueta.id)
      if (!duplicada) {
        resultado.push(etiqueta)
      }
    }

    return resultado
  }

  async crearCita(dto: CrearCitaDto, usuarioAuditoria: string) {
    return await this.dataSource.transaction(async (manager) => {
      if (dto.agrupadorId) {
        const agrupador = await this.obtenerAgrupadorPorId(
          dto.agrupadorId,
          manager
        )
        if (!agrupador) {
          return null
        }
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
  }

  async actualizarCita(
    id: string,
    dto: ActualizarCitaDto,
    usuarioAuditoria: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }

      if (dto.agrupadorId) {
        const agrupador = await this.obtenerAgrupadorPorId(
          dto.agrupadorId,
          manager
        )
        if (!agrupador) {
          return null
        }
      }

      Object.assign(cita, {
        detalle: dto.detalle ?? cita.detalle,
        fechaInicio: dto.fechaInicio
          ? new Date(dto.fechaInicio)
          : cita.fechaInicio,
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

      return true
    })
  }

  async actualizarEstadoCita(
    id: string,
    dto: ActualizarEstadoCitaDto,
    usuarioAuditoria: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      cita.estado = dto.estado
      cita.comentarioNutricionista = dto.comentario
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      return true
    })
  }

  async reprogramarCita(
    id: string,
    dto: ReprogramarCitaDto,
    usuarioAuditoria: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      cita.fechaInicio = new Date(dto.fechaInicio)
      cita.fechaFin = new Date(dto.fechaFin)
      cita.comentarioNutricionista = dto.comentario
      cita.estado =
        CitasEstado.RECHAZADA === cita.estado
          ? CitasEstado.SOLICITADA
          : (cita.estado as CitasEstado)
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      return true
    })
  }

  async cancelarCita(
    id: string,
    dto: CancelarCitaDto,
    usuarioAuditoria: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      cita.estado = CitasEstado.CANCELADA
      cita.comentarioNutricionista = dto.comentario
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      return true
    })
  }

  async actualizarEtiquetas(
    id: string,
    dto: ActualizarEtiquetasCitaDto,
    usuarioAuditoria: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
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
      return true
    })
  }

  async actualizarAgrupadorCita(
    id: string,
    dto: ActualizarAgrupadorCitaDto,
    usuarioAuditoria: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const agrupador = await this.obtenerAgrupadorPorId(
        dto.agrupadorId,
        manager
      )
      if (!agrupador) {
        return null
      }
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      cita.idAgrupador = dto.agrupadorId
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      return true
    })
  }
}
