import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { CrearCitaDto } from '../dto/citas.dto'
import { Cita } from '../entities/cita.entity'
import { CitasEstado } from '../constant'

@Injectable()
export class CitasRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string, transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(Cita)
      .createQueryBuilder('citas')
      .where({ id })
      .getOne()
  }

  async actualizar({
    id,
    datosDto,
    usuarioAuditoria,
    transaccion,
  }: {
    id: string
    datosDto: Partial<Cita>
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    const datosActualizar = new Cita({
      ...datosDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await (transaccion || this.dataSource)
      .getRepository(Cita)
      .update(id, datosActualizar)
  }

  async crear({
    idMedico,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idMedico: string
    data: CrearCitaDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const { idPaciente, detalle, fechaFin, fechaInicio } = data
    const consultas = new Cita({
      idMedico,
      idPaciente,
      detalle,
      fechaFin,
      fechaInicio,
      usuarioCreacion: usuarioAuditoria,
    })
    return await transaccion.getRepository(Cita).save(consultas)
  }

  async listarPorPaciente({ idUsuarioRol }: { idUsuarioRol: string }) {
    return await this.dataSource
      .getRepository(Cita)
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
      .andWhere('citas.estado != :estado', { estado: CitasEstado.INACTIVO })
      .getManyAndCount()
  }

  async listarPorNutricionista({ idUsuarioRol }: { idUsuarioRol: string }) {
    return await this.dataSource
      .getRepository(Cita)
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
      .andWhere('citas.estado != :estado', { estado: CitasEstado.INACTIVO })
      .getManyAndCount()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
