import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto'
import { Status } from 'src/common/constants'
import dayjs from 'dayjs'
import { Comentario } from '../entities/comentario.entity'
import { CrearComentarioDto } from '../dtos/comentario.dto'
import { ArchivoAdjunto } from '../entities/archivos-adjunto.entity'

@Injectable()
export class ComentarioRepository {
  constructor(private dataSource: DataSource) {}

  async crearPorRecurso({
    idHistoriaClinica,
    idUsuarioRol,
    comentarioDto,
    usuarioAuditoria,
    transaccion,
  }: {
    idHistoriaClinica: string
    idUsuarioRol: string
    comentarioDto: CrearComentarioDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    const newComentario = new Comentario({
      ...comentarioDto,
      idHistoriaClinica,
      idUsuarioRol,
      usuarioCreacion: usuarioAuditoria,
      fechaCreacion: dayjs().toDate(),
    })
    const repository = transaccion
      ? transaccion.getRepository(Comentario)
      : this.dataSource.getRepository(Comentario)
    return await repository.save(newComentario)
  }

  async responderComentario({
    comentarioDto,
    idComentarioPadre,
    usuarioAuditoria,
    idUsuarioRol,
    idHistoriaClinica,
    transaccion,
  }: {
    comentarioDto: CrearComentarioDto
    idComentarioPadre: string
    usuarioAuditoria: string
    idUsuarioRol: string
    idHistoriaClinica: string
    transaccion?: EntityManager
  }) {
    const newComentario = new Comentario({
      ...comentarioDto,
      idComentarioPadre,
      usuarioCreacion: usuarioAuditoria,
      idUsuarioRol,
      idHistoriaClinica,
      fechaCreacion: dayjs().toDate(),
    })
    const repository = transaccion
      ? transaccion.getRepository(Comentario)
      : this.dataSource.getRepository(Comentario)
    return await repository.save(newComentario)
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
      .leftJoinAndSelect('comentario.usuarioRol', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuarioRol.rol', 'rol')
      .leftJoinAndSelect(
        'comentario.archivos',
        'archivosComentario',
        'archivosComentario.estado = :estadoArchivo'
      )
      .leftJoinAndSelect(
        'comentario.respuestas',
        'respuesta',
        'respuesta.estado = :estadoRespuesta',
        { estadoRespuesta: Status.ACTIVE }
      )
      .leftJoinAndSelect('respuesta.usuarioRol', 'usuarioRolRespuesta')
      .leftJoinAndSelect('usuarioRolRespuesta.usuario', 'usuarioRespuesta')
      .leftJoinAndSelect('usuarioRespuesta.persona', 'personaRespuesta')
      .leftJoinAndSelect('usuarioRolRespuesta.rol', 'rolRespuesta')
      .leftJoinAndSelect(
        'respuesta.archivos',
        'archivosRespuesta',
        'archivosRespuesta.estado = :estadoArchivo'
      )
      .where('comentario.idHistoriaClinica = :idHistoriaClinica', {
        idHistoriaClinica,
      })
      .andWhere('comentario.estado = :estado', { estado: Status.ACTIVE })
      .orderBy('comentario.fechaCreacion', 'ASC')
      .addOrderBy('respuesta.fechaCreacion', 'ASC')
      .take(limite)
      .skip(saltar)
    return await query
      .setParameters({
        estadoArchivo: Status.ACTIVE,
        estadoRespuesta: Status.ACTIVE,
      })
      .getManyAndCount()
  }

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Comentario)
      .createQueryBuilder('comentario')
      .where({ id })
      .getOne()
  }

  async obtenerDetalle(id: string) {
    return await this.dataSource
      .getRepository(Comentario)
      .createQueryBuilder('comentario')
      .leftJoinAndSelect('comentario.usuarioRol', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.usuario', 'usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuarioRol.rol', 'rol')
      .leftJoinAndSelect(
        'comentario.archivos',
        'archivosComentario',
        'archivosComentario.estado = :estadoArchivo'
      )
      .leftJoinAndSelect(
        'comentario.respuestas',
        'respuesta',
        'respuesta.estado = :estadoRespuesta',
        { estadoRespuesta: Status.ACTIVE }
      )
      .leftJoinAndSelect('respuesta.usuarioRol', 'usuarioRolRespuesta')
      .leftJoinAndSelect('usuarioRolRespuesta.usuario', 'usuarioRespuesta')
      .leftJoinAndSelect('usuarioRespuesta.persona', 'personaRespuesta')
      .leftJoinAndSelect('usuarioRolRespuesta.rol', 'rolRespuesta')
      .leftJoinAndSelect(
        'respuesta.archivos',
        'archivosRespuesta',
        'archivosRespuesta.estado = :estadoArchivo'
      )
      .where('comentario.id = :id', { id })
      .setParameters({
        estadoArchivo: Status.ACTIVE,
        estadoRespuesta: Status.ACTIVE,
      })
      .getOne()
  }

  async runTransaction<T>(op: (manager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction(op)
  }

  async buscarArchivoPorId(id: string) {
    return await this.dataSource
      .getRepository(ArchivoAdjunto)
      .createQueryBuilder('archivo')
      .leftJoinAndSelect('archivo.comentario', 'comentario')
      .leftJoinAndSelect('archivo.historiaClinica', 'historiaClinica')
      .where('archivo.id = :id', { id })
      .andWhere('archivo.estado = :estadoArchivo', {
        estadoArchivo: Status.ACTIVE,
      })
      .getOne()
  }
}
