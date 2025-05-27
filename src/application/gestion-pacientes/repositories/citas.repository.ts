import { Brackets, DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { CrearCitaDto } from '../dto/citas.dto'
import { Cita } from '../entities/cita.entity'
import { CitasEstado } from '../constant'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

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

  async listarPorPaciente({
    idUsuarioRol,
    estado,
    transaccion,
  }: {
    idUsuarioRol: string
    estado?: CitasEstado
    transaccion?: EntityManager
  }) {
    const query = (transaccion || this.dataSource)
      .getRepository(Cita)
      .createQueryBuilder('citas')
      .leftJoinAndSelect('citas.medico', 'medico')
      .leftJoinAndSelect('medico.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')

      .leftJoinAndSelect('citas.paciente', 'paciente')
      .leftJoinAndSelect('paciente.usuario', 'usuarioPaciente')
      .leftJoinAndSelect('usuarioPaciente.persona', 'personaPaciente')
      .select([
        'citas.id',
        'citas.detalle',
        'citas.fechaInicio',
        'citas.fechaFin',
        'citas.estado',
        'medico.id',
        'paciente.id',
        'usuario.id',
        'usuario.urlFoto',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'persona.nroDocumento',
        // paciente
        'usuarioPaciente.id',
        'usuarioPaciente.urlFoto',
        'personaPaciente.nombres',
        'personaPaciente.primerApellido',
        'personaPaciente.segundoApellido',
        'personaPaciente.nroDocumento',
      ])
      .where({ idPaciente: idUsuarioRol })
      .andWhere('citas.estado != :estado', { estado: CitasEstado.INACTIVO })
    if (estado) {
      query.andWhere('citas.estado = :estados', { estados: estado })
    }
    return await query.getManyAndCount()
  }

  async listarPorPacientePaginado({
    idPaciente,
    paginacion,
    transaccion,
  }: {
    idPaciente: string
    paginacion: PaginacionQueryDto
    transaccion?: EntityManager
  }) {
    const { limite, saltar, orden, sentido, filtro } = paginacion
    const query = (transaccion || this.dataSource)
      .getRepository(Cita)
      .createQueryBuilder('citas')
      .leftJoinAndSelect('citas.medico', 'medico')
      .leftJoinAndSelect('medico.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')

      .leftJoinAndSelect('citas.paciente', 'paciente')
      .leftJoinAndSelect('paciente.usuario', 'usuarioPaciente')
      .leftJoinAndSelect('usuarioPaciente.persona', 'personaPaciente')
      .select([
        'citas.id',
        'citas.detalle',
        'citas.fechaInicio',
        'citas.fechaFin',
        'citas.estado',
        'medico.id',
        'paciente.id',
        'usuario.id',
        'usuario.urlFoto',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'persona.nroDocumento',
        // paciente
        'usuarioPaciente.id',
        'usuarioPaciente.urlFoto',
        'personaPaciente.nombres',
        'personaPaciente.primerApellido',
        'personaPaciente.segundoApellido',
        'personaPaciente.nroDocumento',
      ])
      .take(limite)
      .skip(saltar)
      .where({ idPaciente })
      .andWhere('citas.estado != :estado', { estado: CitasEstado.INACTIVO })

    switch (orden) {
      case 'detalle':
        query.addOrderBy('citas.detalle', sentido)
        break
      case 'fechaInicio':
        query.addOrderBy('citas.fechaInicio', sentido)
        break
      case 'estado':
        query.addOrderBy('citas.estado', sentido)
        break
      default:
        query.addOrderBy('usuario.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('citas.detalle ilike :filtro', { filtro: `%${filtro}%` })
          qb.orWhere('citas.estado ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('persona.nombres ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('persona.primerApellido ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('persona.segundoApellido ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }

    return await query.getManyAndCount()
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

  async listarCitasPendientes(transaccion?: EntityManager) {
    return await (transaccion || this.dataSource)
      .getRepository(Cita)
      .createQueryBuilder('citas')
      .leftJoinAndSelect('citas.paciente', 'paciente')
      .leftJoinAndSelect('citas.notificacion', 'notificacion')
      .where('citas.estado = :estado', {
        estado: CitasEstado.PENDIENTE,
      })
      .getMany()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
