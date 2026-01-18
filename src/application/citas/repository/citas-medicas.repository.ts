import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm'
import { Cita } from '../entities/cita.entity'
import { CitasEstado } from '../constants'
import {
  ActualizarEstadoCitaDto,
  CancelarCitaDto,
  FiltrosCitaDto,
  FiltrosCitaPaginadoDto,
  ReprogramarCitaDto,
} from '../dto/cita.dto'
import { Estudio } from '@/application/estudio/entities/estudio.entity'
import { HistorialCita } from '../entities/cita-historial.entity'

@Injectable()
export class CitasMedicasRepository {
  constructor(private readonly dataSource: DataSource) {}

  private citaRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Cita)
  }

  private historialRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(HistorialCita)
  }

  buildCitasQuery(
    filtros: FiltrosCitaDto | FiltrosCitaPaginadoDto,
    manager?: EntityManager
  ): SelectQueryBuilder<Cita> {
    const query = this.citaRepository(manager)
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.medico', 'medico')
      .leftJoinAndSelect('medico.usuario', 'usuarioMedico')
      .leftJoinAndSelect('usuarioMedico.persona', 'personaMedico')
      .leftJoinAndSelect(
        'medico.usuarioRolEspecialidades',
        'medicoEspecialidad'
      )
      .leftJoinAndSelect(
        'medicoEspecialidad.especialidad',
        'especialidadMedico'
      )
      .leftJoinAndSelect('cita.paciente', 'paciente')
      .leftJoinAndSelect('cita.consultorio', 'consultorio')
      .leftJoinAndSelect('cita.especialidad', 'especialidad')
      .leftJoinAndSelect('cita.estudio', 'estudio')
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
    data: {
      detalle: string
      fechaInicio: Date
      fechaFin: Date
      idMedico: string
      idPaciente?: string | null
      idConsultorio?: string | null
      idEspecialidad?: string | null
      idEstudio?: string | null
      esEstudio: boolean
    },
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const cita = this.citaRepository(transaccion).create({
      detalle: data.detalle,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      estado: CitasEstado.SOLICITADA,
      usuarioCreacion: usuarioAuditoria,
      idMedico: data.idMedico,
      idPaciente: data.idPaciente ?? null,
      idConsultorio: data.idConsultorio ?? null,
      idEspecialidad: data.idEspecialidad ?? null,
      idEstudio: data.idEstudio ?? null,
      esEstudio: data.esEstudio,
    })

    const guardada = await this.citaRepository(transaccion).save(cita)

    return guardada.id
  }

  async actualizarCita(
    cita: Cita,
    data: {
      detalle?: string
      fechaInicio: Date
      fechaFin: Date
      idMedico?: string
      idPaciente?: string | null
      idConsultorio?: string | null
      idEspecialidad?: string | null
      idEstudio?: string | null
      esEstudio: boolean
    },
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    Object.assign(cita, {
      detalle: data.detalle ?? cita.detalle,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      idMedico: data.idMedico ?? cita.idMedico,
      idPaciente:
        data.idPaciente !== undefined ? data.idPaciente : cita.idPaciente,
      idConsultorio:
        data.idConsultorio !== undefined
          ? data.idConsultorio
          : cita.idConsultorio,
      idEspecialidad:
        data.idEspecialidad !== undefined
          ? data.idEspecialidad
          : cita.idEspecialidad,
      idEstudio: data.esEstudio ? (data.idEstudio ?? cita.idEstudio) : null,
      esEstudio: data.esEstudio,
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
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      return true
    })
  }

  async reprogramarCita(
    id: string,
    dto: ReprogramarCitaDto & { fechaFin: Date },
    usuarioAuditoria: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      cita.fechaInicio = new Date(dto.fechaInicio)
      cita.fechaFin = dto.fechaFin
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
    usuarioAuditoria: string,
    rolEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      const estadoAnterior = cita.estado
      cita.estado = CitasEstado.CANCELADA
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      const historial = this.historialRepository(manager).create({
        idCita: cita.id,
        estadoAnterior,
        rolEjecutor,
        idEjecutor: usuarioAuditoria,
        comentario: dto.comentario ?? null,
        usuarioCreacion: usuarioAuditoria,
      })
      await this.historialRepository(manager).save(historial)
      return true
    })
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }

  async obtenerEstudioPorEspecialidad(
    idEstudio: string,
    idEspecialidad: string,
    manager?: EntityManager
  ) {
    const entityManager = manager ?? this.dataSource.manager
    return await entityManager
      .getRepository(Estudio)
      .createQueryBuilder('estudio')
      .innerJoin(
        'estudio.estudioEspecialidades',
        'estudioEspecialidad',
        'estudioEspecialidad.especialidadId = :idEspecialidad',
        { idEspecialidad }
      )
      .where('estudio.id = :idEstudio', { idEstudio })
      .getOne()
  }
}
