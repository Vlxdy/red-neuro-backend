import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm'
import { HistorialCita } from '../entities/cita-historial.entity'
import { FiltrosHistorialCitaPaginadoDto } from '../dto/cita.dto'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import dayjs from 'dayjs'
import { Paciente } from '@/application/paciente/entities/paciente.entity'
import { Estudio } from '@/application/estudio/entities/estudio.entity'

@Injectable()
export class HistorialCitasRepository {
  constructor(private readonly dataSource: DataSource) {}

  private historialRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(HistorialCita)
  }

  private usuarioRolRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(UsuarioRol)
  }

  private pacienteRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Paciente)
  }

  private estudioRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Estudio)
  }

  async crearHistorial(data: Partial<HistorialCita>, manager?: EntityManager) {
    const repo = this.historialRepository(manager)
    data.fechaCreacion = dayjs().toDate()
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
    const historial = repo.create(data)
    return await repo.save(historial)
  }

  buildHistorialQuery(
    idCita: string,
    filtros: FiltrosHistorialCitaPaginadoDto
  ): SelectQueryBuilder<HistorialCita> {
    const query = this.historialRepository()
      .createQueryBuilder('historial')
      .where('historial.idCita = :idCita', { idCita })

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

    return query.orderBy('historial.fechaCreacion', 'DESC')
  }

  async listarHistorialCitaPaginado(
    idCita: string,
    filtros: FiltrosHistorialCitaPaginadoDto
  ) {
    const { limite, saltar } = filtros
    return await this.buildHistorialQuery(idCita, filtros)
      .take(limite)
      .skip(saltar)
      .getManyAndCount()
  }

  async obtenerUsuariosRolPorIds(ids: string[]): Promise<UsuarioRol[]> {
    if (!ids.length) {
      return []
    }

    return await this.usuarioRolRepository()
      .createQueryBuilder('usuarioRol')
      .leftJoinAndSelect('usuarioRol.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect(
        'usuarioRol.usuarioRolEspecialidades',
        'usuarioRolEspecialidades'
      )
      .leftJoinAndSelect(
        'usuarioRolEspecialidades.especialidad',
        'especialidad'
      )
      .where('usuarioRol.id IN (:...ids)', { ids })
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

  async obtenerEstudiosPorIds(ids: string[]) {
    if (!ids.length) {
      return []
    }

    return await this.estudioRepository()
      .createQueryBuilder('estudio')
      .where('estudio.id IN (:...ids)', { ids })
      .getMany()
  }
}
