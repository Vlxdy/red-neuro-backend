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
        uuidCiudadano: personaDto.uuidCiudadano,
      })
    )
  }

  async buscarPersonaPorCI(persona: PersonaDto) {
    return await this.dataSource
      .getRepository(Persona)
      .createQueryBuilder('persona')
      .where('persona.nro_documento = :ci', { ci: persona.nroDocumento })
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
