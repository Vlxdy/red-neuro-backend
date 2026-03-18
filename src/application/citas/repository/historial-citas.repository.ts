import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm'
import { HistorialCita } from '../entities/cita-historial.entity'
import { Cita } from '../entities/cita.entity'
import { FiltrosHistorialCitaPaginadoDto } from '../dto/cita.dto'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import dayjs from 'dayjs'
import { Paciente } from '@/application/paciente/entities/paciente.entity'
import { Servicio } from '@/application/servicio/entities/servicio.entity'

@Injectable()
export class HistorialCitasRepository {
  constructor(private readonly dataSource: DataSource) {}

  private historialRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(HistorialCita)
  }

  private citaRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Cita)
  }

  private usuarioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Usuario)
  }

  private pacienteRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Paciente)
  }

  private servicioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Servicio)
  }

  async crearHistorial(data: Partial<HistorialCita>, manager?: EntityManager) {
    const repo = this.historialRepository(manager)
    data.fechaCreacion = dayjs().toDate()
    data.idHistorialCita =
      data.idHistorialCita ??
      (data.idCita
        ? await this.obtenerIdHistorialCitaDeCita(data.idCita, manager)
        : null)
    const historial = repo.create(data)
    return await repo.save(historial)
  }

  async crearHistoriales(
    data: Array<Partial<HistorialCita>>,
    manager?: EntityManager
  ) {
    if (!data.length) {
      return []
    }
    const repo = this.historialRepository(manager)
    const enriched = await Promise.all(
      data.map(async (item) => ({
        ...item,
        idHistorialCita:
          item.idHistorialCita ??
          (item.idCita
            ? await this.obtenerIdHistorialCitaDeCita(item.idCita, manager)
            : null),
      }))
    )
    const historial = repo.create(enriched)
    return await repo.save(historial)
  }

  private async obtenerIdHistorialCitaDeCita(
    idCita: string,
    manager?: EntityManager
  ): Promise<string | null> {
    const cita = await this.citaRepository(manager).findOne({
      where: { id: idCita },
      select: { idHistorialCita: true },
    })
    return cita?.idHistorialCita ?? null
  }

  buildHistorialQuery(
    idCita: string,
    filtros: FiltrosHistorialCitaPaginadoDto,
    idHistorialCita?: string | null
  ): SelectQueryBuilder<HistorialCita> {
    const query = this.historialRepository().createQueryBuilder('historial')

    if (idHistorialCita) {
      query.where('historial.idHistorialCita = :idHistorialCita', {
        idHistorialCita,
      })
    } else {
      query.where('historial.idCita = :idCita', { idCita })
    }

    if (filtros.fechaInicio) {
      query.andWhere('historial.fechaCreacion >= :fechaInicio', {
        fechaInicio: filtros.fechaInicio,
      })
    }

    if (filtros.fechaFin) {
      query.andWhere('historial.fechaCreacion <= :fechaFin', {
        fechaFin: filtros.fechaFin,
      })
    }

    if (filtros.idEjecutor) {
      query.andWhere('historial.idEjecutor = :idEjecutor', {
        idEjecutor: filtros.idEjecutor,
      })
    }

    return query
      .orderBy('historial.fechaCreacion', 'DESC')
      .addOrderBy('historial.id', 'DESC')
  }

  async listarHistorialCitaPaginado(
    idCita: string,
    filtros: FiltrosHistorialCitaPaginadoDto
  ) {
    const { limite, saltar } = filtros
    const idHistorialCita = await this.obtenerIdHistorialCitaDeCita(idCita)
    return await this.buildHistorialQuery(idCita, filtros, idHistorialCita)
      .take(limite)
      .skip(saltar)
      .getManyAndCount()
  }

  async obtenerUsuariosPorIds(ids: string[]): Promise<Usuario[]> {
    if (!ids.length) {
      return []
    }

    return await this.usuarioRepository()
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .where('usuario.id IN (:...ids)', { ids })
      .getMany()
  }

  async obtenerPacientesPorIds(ids: string[]) {
    if (!ids.length) {
      return []
    }

    return await this.pacienteRepository()
      .createQueryBuilder('paciente')
      .where('paciente.id IN (:...ids)', { ids })
      .getMany()
  }

  async obtenerServiciosPorIds(ids: string[]) {
    if (!ids.length) {
      return []
    }

    return await this.servicioRepository()
      .createQueryBuilder('servicio')
      .where('servicio.id IN (:...ids)', { ids })
      .getMany()
  }
}
