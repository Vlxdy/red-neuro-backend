import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { PacienteProfesionalInvitado } from '../entities/paciente-profesional-invitado.entity'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Paciente } from '../entities/paciente.entity'
import { Status } from '@/common/constants'

@Injectable()
export class PacienteProfesionalInvitadoRepository {
  constructor(private readonly dataSource: DataSource) {}

  private relationRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(
      PacienteProfesionalInvitado
    )
  }

  async asignarPaciente(
    idPaciente: string,
    idProfesionalInvitado: string,
    idCitaOrigen: string,
    usuarioAuditoria: string,
    manager?: EntityManager
  ) {
    const existente = await this.relationRepository(manager).findOne({
      where: {
        idPaciente,
        idProfesionalInvitado,
        estado: Status.ACTIVE,
      },
    })

    if (existente) {
      return existente
    }

    const relacion = this.relationRepository(manager).create({
      idPaciente,
      idProfesionalInvitado,
      idCitaOrigen,
      usuarioCreacion: usuarioAuditoria,
      transaccion: 'CREAR',
      estado: Status.ACTIVE,
    })

    return await this.relationRepository(manager).save(relacion)
  }

  async listarPacientesAsignadosPaginado(
    paginacionQuery: PaginacionQueryDto,
    idProfesionalInvitado: string
  ): Promise<[Paciente[], number]> {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.dataSource
      .getRepository(Paciente)
      .createQueryBuilder('paciente')
      .innerJoin(
        PacienteProfesionalInvitado,
        'relacion',
        'relacion.id_paciente = paciente.id AND relacion.id_profesional_invitado = :idProfesionalInvitado AND relacion._estado = :estadoRelacion',
        {
          idProfesionalInvitado,
          estadoRelacion: Status.ACTIVE,
        }
      )
      .select([
        'paciente.id',
        'paciente.nombres',
        'paciente.primerApellido',
        'paciente.segundoApellido',
        'paciente.nroDocumento',
        'paciente.fechaNacimiento',
        'paciente.telefono',
        'paciente.genero',
        'paciente.observacion',
        'paciente.estado',
      ])
      .distinct(true)
      .take(limite)
      .skip(saltar)

    if (filtro) {
      const filtroNormalizado = filtro.trim()
      const nombreCompleto = `
    unaccent(lower(concat_ws(' ', paciente.nombres, paciente.primerApellido, paciente.segundoApellido)))
  `
      query.andWhere(
        `(
          ${nombreCompleto} ILIKE unaccent(lower(:filtro))
          OR paciente.nroDocumento ILIKE :filtroExacto
          OR paciente.telefono ILIKE :filtroExacto
        )`,
        {
          filtro: `%${filtroNormalizado}%`,
          filtroExacto: `${filtroNormalizado}%`,
        }
      )
    }

    switch (orden) {
      case 'nombres':
        query.addOrderBy('paciente.nombres', sentido)
        break
      case 'primerApellido':
        query.addOrderBy('paciente.primerApellido', sentido)
        break
      case 'segundoApellido':
        query.addOrderBy('paciente.segundoApellido', sentido)
        break
      case 'nroDocumento':
        query.addOrderBy('paciente.nroDocumento', sentido)
        break
      default:
        query.addOrderBy('paciente.id', 'ASC')
    }

    return await query.getManyAndCount()
  }

  async tienePacienteAsignado(
    idPaciente: string,
    idProfesionalInvitado: string,
    manager?: EntityManager
  ): Promise<boolean> {
    const total = await this.relationRepository(manager).count({
      where: {
        idPaciente,
        idProfesionalInvitado,
        estado: Status.ACTIVE,
      },
    })

    return total > 0
  }
}
