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
    await repo.update(id, {
      nombres: personaDto.nombres,
      primerApellido: personaDto.primerApellido,
      segundoApellido: personaDto.segundoApellido,
      usuarioModificacion: usuarioAuditoria,
      telefono: personaDto.telefono,
    })
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
