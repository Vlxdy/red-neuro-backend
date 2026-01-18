import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { Paciente } from '../entities/paciente.entity'
import { ActualizarPacienteDto, CrearPacienteDto } from '../dto/paciente.dto'

@Injectable()
export class PacienteRepository {
  constructor(private readonly dataSource: DataSource) {}

  private pacienteRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Paciente)
  }

  async listarPacientesPaginado(paginacionQuery: PaginacionQueryDto) {
    const { limite, saltar, filtro, orden, sentido } = paginacionQuery

    const query = this.pacienteRepository()
      .createQueryBuilder('paciente')
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
      .take(limite)
      .skip(saltar)

    if (filtro) {
      const filtroNormalizado = filtro.trim()

      // Recomendado: habilitar extensión unaccent (más abajo te digo)
      const nombreCompleto = `
    unaccent(lower(concat_ws(' ', paciente.nombres, paciente.primerApellido, paciente.segundoApellido)))
  `
      const filtroExpr = `unaccent(lower(:filtro))`

      // Score por similitud
      query.addSelect(`similarity(${nombreCompleto}, ${filtroExpr})`, 'score')

      // Bonus si hace match por doc o telefono (para que suban arriba)
      // (puedes ajustar pesos)
      query.addSelect(
        `(CASE WHEN paciente.nroDocumento ILIKE :filtroExacto THEN 1 ELSE 0 END)`,
        'match_doc'
      )
      query.addSelect(
        `(CASE WHEN paciente.telefono ILIKE :filtroExacto THEN 1 ELSE 0 END)`,
        'match_tel'
      )

      // 👇 OJO: NO ponemos WHERE por similarity, así SIEMPRE devuelve algo
      // Si quieres, puedes filtrar únicamente cuando filtro sea muy corto (opcional),
      // pero tu requerimiento dice "que siempre me salga"
      query.setParameters({
        filtro: filtroNormalizado,
        filtroExacto: `%${filtroNormalizado}%`,
      })

      // Orden: primero doc/tel, luego similitud
      query.orderBy('match_doc', 'DESC')
      query.addOrderBy('match_tel', 'DESC')
      query.addOrderBy('score', 'DESC')
    } else {
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
        case 'telefono':
          query.addOrderBy('paciente.telefono', sentido)
          break
        case 'estado':
          query.addOrderBy('paciente.estado', sentido)
          break
        default:
          query.addOrderBy('paciente.id', 'ASC')
      }
    }

    return await query.getManyAndCount()
  }

  async obtenerPacientePorId(id: string, manager?: EntityManager) {
    return await this.pacienteRepository(manager).findOne({ where: { id } })
  }

  async crearPaciente(
    dto: CrearPacienteDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    const nuevo = this.pacienteRepository(transaccion).create({
      ...dto,
      fechaNacimiento: dto.fechaNacimiento
        ? new Date(dto.fechaNacimiento)
        : null,
      usuarioCreacion: usuarioAuditoria,
    })

    return await this.pacienteRepository(transaccion).save(nuevo)
  }

  async actualizarPaciente(
    paciente: Paciente,
    dto: ActualizarPacienteDto,
    usuarioAuditoria: string,
    transaccion: EntityManager
  ) {
    Object.assign(paciente, {
      ...dto,
      fechaNacimiento:
        dto.fechaNacimiento !== undefined
          ? dto.fechaNacimiento
            ? new Date(dto.fechaNacimiento)
            : null
          : paciente.fechaNacimiento,
      usuarioModificacion: usuarioAuditoria,
    })

    return await this.pacienteRepository(transaccion).save(paciente)
  }

  async eliminarPaciente(id: string, transaccion: EntityManager) {
    await this.pacienteRepository(transaccion).delete(id)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
