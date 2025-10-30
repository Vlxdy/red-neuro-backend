import { DataSource, EntityManager } from 'typeorm'
import { Persona } from '../entity/persona.entity'
import { PersonaDto } from '../dto/persona.dto'
import { Injectable } from '@nestjs/common'
import { PersonaEstado } from '@/core/usuario/constant'

@Injectable()
export class PersonaRepository {
  constructor(private dataSource: DataSource) {}

  async crear(
    personaDto: PersonaDto,
    usuarioAuditoria: string,
    transaction?: EntityManager
  ) {
    return await (
      transaction?.getRepository(Persona) ??
      this.dataSource.getRepository(Persona)
    ).save(
      new Persona({
        nombres: personaDto?.nombres,
        primerApellido: personaDto?.primerApellido,
        segundoApellido: personaDto?.segundoApellido,
        nroDocumento: personaDto?.nroDocumento,
        fechaNacimiento: personaDto?.fechaNacimiento,
        tipoDocumento: personaDto.tipoDocumento,
        telefono: personaDto?.telefono,
        genero: personaDto?.genero,
        usuarioCreacion: usuarioAuditoria,
      })
    )
  }

  async actualizar(
    id: string,
    personaDto: Partial<PersonaDto>,
    usuarioAuditoria: string,
    transaction?: EntityManager
  ) {
    const repo =
      transaction?.getRepository(Persona) ??
      this.dataSource.getRepository(Persona)

    const datosActualizar: Partial<Persona> = {
      usuarioModificacion: usuarioAuditoria,
    }

    if (personaDto.nombres !== undefined) {
      datosActualizar.nombres = personaDto.nombres
    }

    if (personaDto.primerApellido !== undefined) {
      datosActualizar.primerApellido = personaDto.primerApellido
    }

    if (personaDto.segundoApellido !== undefined) {
      datosActualizar.segundoApellido = personaDto.segundoApellido
    }

    if (personaDto.telefono !== undefined) {
      datosActualizar.telefono = personaDto.telefono
    }

    if (personaDto.fechaNacimiento !== undefined) {
      datosActualizar.fechaNacimiento = personaDto.fechaNacimiento
    }

    if (personaDto.genero !== undefined) {
      datosActualizar.genero = personaDto.genero
    }

    if (personaDto.nroDocumento !== undefined) {
      datosActualizar.nroDocumento = personaDto.nroDocumento
    }

    if (personaDto.tipoDocumento !== undefined) {
      datosActualizar.tipoDocumento = personaDto.tipoDocumento
    }

    await repo.update(id, datosActualizar)
    return await repo.findOne({ where: { id } })
  }

  async actualizarDatosContacto(
    id: string,
    datos: { telefono?: string | null; genero?: string | null },
    usuarioAuditoria: string,
    transaction?: EntityManager
  ) {
    const datosActualizar: Partial<Persona> = {
      usuarioModificacion: usuarioAuditoria,
    }

    if (datos.telefono !== undefined) {
      datosActualizar.telefono = datos.telefono
    }

    if (datos.genero !== undefined) {
      datosActualizar.genero = datos.genero
    }

    const queryBuilder = transaction
      ? transaction.createQueryBuilder().update(Persona)
      : this.dataSource.createQueryBuilder().update(Persona)

    return await queryBuilder
      .set(datosActualizar)
      .where('id = :id', { id })
      .execute()
  }

  async buscarPersonaPorCI(persona: PersonaDto) {
    return await this.dataSource
      .getRepository(Persona)
      .createQueryBuilder('persona')
      .where('persona.nro_documento = :ci', { ci: persona.nroDocumento })
      .getOne()
  }

  async buscarPersonaPorTelefono(
    telefono: string,
    transaction?: EntityManager
  ) {
    return await (
      transaction?.getRepository(Persona) ??
      this.dataSource.getRepository(Persona)
    )
      .createQueryBuilder('persona')
      .where('persona.telefono = :telefono', { telefono })
      .getOne()
  }

  async buscarPersonaPorDocumento(
    tipoDocumento: string,
    numeroDocumento: string
  ) {
    return await this.dataSource
      .getRepository(Persona)
      .createQueryBuilder('p')
      .where('p.nro_documento = :numeroDocumento', { numeroDocumento })
      .andWhere('p.tipo_documento = :tipoDocumento', { tipoDocumento })
      .andWhere('p.estado = :estado', { estado: PersonaEstado.ACTIVE })
      .getOne()
  }

  async buscarPersonaId(id: string, transaction?: EntityManager) {
    return await (
      transaction?.getRepository(Persona) ??
      this.dataSource.getRepository(Persona)
    )
      .createQueryBuilder('persona')
      .where('persona.id = :id', { id: id })
      .getOne()
  }
}
