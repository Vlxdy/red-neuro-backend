import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { CrearCitaDto } from '../dto/citas.dto'
import { HistorialCita } from '../entities/cita-historial.entity'

@Injectable()
export class HistorialCitaRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(HistorialCita)
      .createQueryBuilder('citas')
      .where({ id })
      .getOne()
  }

  async actualizar({
    id,
    datosDto,
    usuarioAuditoria,
  }: {
    id: string
    datosDto: Partial<HistorialCita>
    usuarioAuditoria: string
  }) {
    const datosActualizar = new HistorialCita({
      ...datosDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource
      .getRepository(HistorialCita)
      .update(id, datosActualizar)
  }

  async crear({
    usuarioAuditoria,
    transaccion,
  }: {
    idMedico: string
    data: CrearCitaDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const consultas = new HistorialCita({
      usuarioCreacion: usuarioAuditoria,
    })
    return await transaccion.getRepository(HistorialCita).save(consultas)
  }

  async listarPorPaciente({ idUsuarioRol }: { idUsuarioRol: string }) {
    return await this.dataSource
      .getRepository(HistorialCita)
      .createQueryBuilder('citas')
      .leftJoinAndSelect('citas.medico', 'medico')
      .leftJoinAndSelect('medico.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .select([
        'citas.id',
        'citas.detalle',
        'citas.fechaInicio',
        'citas.fechaFin',
        'citas.estado',
        'medico.id',
        'usuario.id',
        'usuario.urlFoto',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'persona.nroDocumento',
      ])
      .where({ idPaciente: idUsuarioRol })
      .getManyAndCount()
  }

  async listarPorNutricionista({ idUsuarioRol }: { idUsuarioRol: string }) {
    return await this.dataSource
      .getRepository(HistorialCita)
      .createQueryBuilder('citas')
      .leftJoinAndSelect('citas.paciente', 'paciente')
      .leftJoinAndSelect('paciente.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .select([
        'citas.id',
        'citas.detalle',
        'citas.fechaInicio',
        'citas.fechaFin',
        'citas.estado',
        'paciente.id',
        'usuario.urlFoto',
        'usuario.id',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'persona.nroDocumento',
      ])
      .where({ idMedico: idUsuarioRol })
      .getManyAndCount()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
