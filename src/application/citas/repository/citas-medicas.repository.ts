import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm'
import { Cita } from '../entities/cita.entity'
import { CitasEstado } from '../constants'
import {
  ActualizarCitaDto,
  ActualizarEstadoCitaDto,
  CancelarCitaDto,
  CrearCitaDto,
  FiltrosCitaDto,
  FiltrosCitaPaginadoDto,
  ReprogramarCitaDto,
} from '../dto/cita.dto'

@Injectable()
export class CitasMedicasRepository {
  constructor(private readonly dataSource: DataSource) {}

  private citaRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Cita)
  }

  buildCitasQuery(
    filtros: FiltrosCitaDto | FiltrosCitaPaginadoDto,
    manager?: EntityManager
  ): SelectQueryBuilder<Cita> {
    const query = this.citaRepository(manager)
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.citaEtiquetas', 'citaEtiqueta')
      .leftJoinAndSelect('citaEtiqueta.etiqueta', 'etiqueta')
      .leftJoinAndSelect('cita.medico', 'medico')
      .leftJoinAndSelect('medico.usuario', 'usuarioMedico')
      .leftJoinAndSelect('usuarioMedico.persona', 'personaMedico')
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

    if (filtros.idMedico) {
      query.andWhere('cita.idMedico = :medicoId', {
        medicoId: filtros.idMedico,
      })
    }

    if (filtros.estado) {
      query.andWhere('cita.estado = :estado', {
        estado: filtros.estado,
      })
    }

    return query
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

  async crearCita(
    dto: CrearCitaDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const cita = this.citaRepository(transaccion).create({
      detalle: dto.detalle,
      fechaInicio: new Date(dto.fechaInicio),
      fechaFin: new Date(dto.fechaFin),
      estado: CitasEstado.SOLICITADA,
      usuarioCreacion: usuarioAuditoria,
      idMedico: dto.idMedico,
    })

    const guardada = await this.citaRepository(transaccion).save(cita)

    return guardada.id
  }

  async actualizarCita(
    cita: Cita,
    dto: ActualizarCitaDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    Object.assign(cita, {
      detalle: dto.detalle ?? cita.detalle,
      fechaInicio: dto.fechaInicio
        ? new Date(dto.fechaInicio)
        : cita.fechaInicio,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : cita.fechaFin,
      idMedico: dto.idMedico ?? cita.idMedico,
      usuarioModificacion: usuarioAuditoria,
    })

    await this.citaRepository(transaccion).save(cita)

    return true
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

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
