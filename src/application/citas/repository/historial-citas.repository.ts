import { Injectable } from '@nestjs/common'
import {
  Brackets,
  DataSource,
  EntityManager,
  SelectQueryBuilder,
} from 'typeorm'
import { HistorialCita } from '../entities/cita-historial.entity'
import { FiltrosHistorialCitaPaginadoDto } from '../dto/cita.dto'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

@Injectable()
export class HistorialCitasRepository {
  constructor(private readonly dataSource: DataSource) {}

  private historialRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(HistorialCita)
  }

  private usuarioRolRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(UsuarioRol)
  }

  async crearHistorial(
    data: {
      idCita: string
      estadoAnterior?: string
      rolEjecutor: string
      idEjecutor: string
      comentario?: string | null
      detalleCambios?: Array<{
        field: string
        before?: string
        after?: string
      }> | null
      usuarioCreacion: string
    },
    manager?: EntityManager
  ) {
    const repo = this.historialRepository(manager)
    const historial = repo.create(data)
    return await repo.save(historial)
  }

  async crearHistoriales(
    data: Array<{
      idCita: string
      estadoAnterior?: string
      rolEjecutor: string
      idEjecutor: string
      comentario?: string | null
      detalleCambios?: Array<{
        field: string
        before?: string
        after?: string
      }> | null
      usuarioCreacion: string
    }>,
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

    if (filtros.estadoAnterior) {
      query.andWhere('historial.estadoAnterior = :estadoAnterior', {
        estadoAnterior: filtros.estadoAnterior,
      })
    }

    if (filtros.rolEjecutor) {
      query.andWhere('historial.rolEjecutor = :rolEjecutor', {
        rolEjecutor: filtros.rolEjecutor,
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

  obtenerEjecutoresHistorial(
    ejecutores: Array<{ idUsuario: string; idRol: string }>
  ) {
    if (!ejecutores.length) {
      return []
    }

    const query = this.usuarioRolRepository()
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
      .where(
        new Brackets((qb) => {
          ejecutores.forEach((ejecutor, index) => {
            qb.orWhere(
              `(usuarioRol.idUsuario = :idUsuario${index} AND usuarioRol.idRol = :idRol${index})`,
              {
                [`idUsuario${index}`]: ejecutor.idUsuario,
                [`idRol${index}`]: ejecutor.idRol,
              }
            )
          })
        })
      )

    return query.getMany()
  }
}
