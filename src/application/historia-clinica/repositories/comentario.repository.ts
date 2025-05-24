import { DataSource } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto'
import { Status } from 'src/common/constants'
import dayjs from 'dayjs'
import { Comentario } from '../entities/comentario.entity'
import { CrearComentarioDto } from '../dtos/comentario.dto'

@Injectable()
export class ComentarioRepository {
  constructor(private dataSource: DataSource) {}

  async crearPorRecurso({
    idHistoriaClinica,
    idUsuarioRol,
    comentarioDto,
    usuarioAuditoria,
  }: {
    idHistoriaClinica: string
    idUsuarioRol: string
    comentarioDto: CrearComentarioDto
    usuarioAuditoria: string
  }) {
    const newComentario = new Comentario({
      ...comentarioDto,
      idHistoriaClinica,
      idUsuarioRol,
      usuarioCreacion: usuarioAuditoria,
      fechaCreacion: dayjs().toDate(),
    })
    return await this.dataSource.getRepository(Comentario).save(newComentario)
  }

  async responderComentario({
    comentarioDto,
    idComentarioPadre,
    usuarioAuditoria,
    idUsuarioRol,
  }: {
    comentarioDto: CrearComentarioDto
    idComentarioPadre: string
    usuarioAuditoria: string
    idUsuarioRol: string
  }) {
    const newComentario = new Comentario({
      ...comentarioDto,
      idComentarioPadre,
      usuarioCreacion: usuarioAuditoria,
      idUsuarioRol,
    })
    return await this.dataSource.getRepository(Comentario).save(newComentario)
  }

  async actualizar(
    id: string,
    comentarioDto: CrearComentarioDto,
    usuarioAuditoria: string
  ) {
    const datosActualizar = new Comentario({
      ...comentarioDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource
      .getRepository(Comentario)
      .update(id, datosActualizar)
  }

  async listarPorRecurso(
    paginacionQueryDto: PaginacionQueryDto,
    idHistoriaClinica: string
  ) {
    const { limite, saltar } = paginacionQueryDto
    const query = this.dataSource
      .getRepository(Comentario)
      .createQueryBuilder('comentario')
      .leftJoin('comentario.usuarioRol', 'usuarioRol')
      .leftJoin('usuarioRol.usuario', 'usuario')
      .leftJoin('usuario.persona', 'persona')
      .leftJoin(
        'comentario.respuestas',
        'respuesta',
        'respuesta.estado = :estadoRespuesta',
        { estadoRespuesta: Status.ACTIVE }
      )
      .leftJoin('respuesta.usuarioRol', 'usuarioRolRespuesta')
      .leftJoin('usuarioRolRespuesta.usuario', 'user')
      .leftJoin('user.persona', 'person')
      .select([
        'comentario.id',
        'comentario.contenido',
        'comentario.fechaCreacion',
        'respuesta.id',
        'respuesta.contenido',
        'respuesta.fechaCreacion',
        'usuario.id',
        'usuario.urlFoto',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'user.id',
        'user.urlFoto',
        'person.nombres',
        'person.primerApellido',
        'person.segundoApellido',
        'usuarioRol.id',
        'usuarioRol.rol',
        'usuarioRolRespuesta.id',
        'usuarioRolRespuesta.rol',
      ])
      .where({ idHistoriaClinica })
      .andWhere({ estado: Status.ACTIVE })
      .orderBy({
        'comentario.id': 'DESC',
      })
      .take(limite)
      .skip(saltar)
    return await query.getManyAndCount()
  }

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Comentario)
      .createQueryBuilder('comentario')
      .where({ id })
      .getOne()
  }
}
