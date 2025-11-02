import { BaseService } from '../../../common/base'
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { Messages } from '../../../common/constants/response-messages'
import { Status } from '../../../common/constants'
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto'
import { ComentarioRepository } from '../repositories/comentario.repository'
import { CrearComentarioDto } from '../dtos/comentario.dto'
import { PacientesService } from '@/application/gestion-pacientes/services/pacientes.service'
import { HistoriaClinicaService } from './historia-clinico.service'
import { RolEnumId } from '@/core/authorization/rol.enum'
import { AsignacionService } from '@/application/gestion-pacientes/services/asignacion.service'
import { ComentarioGateway } from '../gateways/comentario.gateway'
import { Comentario } from '../entities/comentario.entity'
import { HistoriaClinica } from '../entities/historia-clinica.entity'
import {
  ComentarioArchivosService,
  ComentarioArchivoTemporal,
} from './comentario-archivos.service'
import { ArchivoAdjunto } from '../entities/archivos-adjunto.entity'
import { ArchivoAdjuntoMetadataResponse } from '@/common/types/data-response.type'
import { EntityManager } from 'typeorm'

type ActorChat = {
  idRol: string
  idUsuarioRol: string
}

type UsuarioComentarioDto = {
  idUsuario: string
  idUsuarioRol: string
  rol?: string
  urlFoto?: string | null
  nombres?: string | null
  primerApellido?: string | null
  segundoApellido?: string | null
}

export type ComentarioChatDto = {
  id: string
  contenido: string
  fechaCreacion: Date
  idHistoriaClinica?: string | null
  idComentarioPadre?: string | null
  usuario: UsuarioComentarioDto
  respuestas?: ComentarioChatDto[]
  archivos?: ComentarioArchivoChatDto[]
}

export type ComentarioArchivoChatDto = {
  id: string
  nombreArchivo: string
  tipoArchivo: string
  tamanoBytes: number | null
  urlDescarga: string | null
  metadatos?: ArchivoAdjuntoMetadataResponse | null
  fechaCreacion?: Date
}

export type ComentarioArchivoDescarga =
  | {
      tipo: 'path'
      path: string
      nombreArchivo: string
      mimeType: string
    }
  | {
      tipo: 'buffer'
      buffer: Buffer
      nombreArchivo: string
      mimeType: string
    }

@Injectable()
export class ComentarioService extends BaseService {
  constructor(
    @Inject(ComentarioRepository)
    private comentarioRepositorio: ComentarioRepository,
    private readonly pacienteService: PacientesService,
    private readonly historiaClinicaService: HistoriaClinicaService,
    private readonly asignacionService: AsignacionService,
    private readonly comentarioGateway: ComentarioGateway,
    private readonly comentarioArchivosService: ComentarioArchivosService
  ) {
    super()
  }

  async listarPorRecurso({
    paginacionQueryDto,
    idHistoriaClinica,
    actor,
  }: {
    paginacionQueryDto: PaginacionQueryDto
    idHistoriaClinica: string
    actor: ActorChat
  }): Promise<[ComentarioChatDto[], number]> {
    const historia = await this.validarAccesoAHistoria(idHistoriaClinica, actor)

    const resultado = await this.comentarioRepositorio.listarPorRecurso(
      paginacionQueryDto,
      historia.id
    )

    const comentariosDto = resultado[0].map((comentario) =>
      this.formatearComentario(comentario)
    )

    return [comentariosDto, resultado[1]]
  }

  async crear({
    comentarioDto,
    idHistoriaClinica,
    usuarioAuditoria,
    actor,
    archivos,
  }: {
    comentarioDto: CrearComentarioDto
    idHistoriaClinica: string
    usuarioAuditoria: string
    actor: ActorChat
    archivos: ComentarioArchivoTemporal[]
  }) {
    const historia = await this.validarAccesoAHistoria(idHistoriaClinica, actor)

    let comentarioFormateado: ComentarioChatDto
    try {
      comentarioFormateado = await this.comentarioRepositorio.runTransaction(
        async (transaccion) => {
          const comentarioSaved =
            await this.comentarioRepositorio.crearPorRecurso({
              idUsuarioRol: actor.idUsuarioRol,
              idHistoriaClinica: historia.id,
              comentarioDto,
              usuarioAuditoria,
              transaccion,
            })

          await this.comentarioArchivosService.adjuntarArchivos({
            archivos,
            idComentario: comentarioSaved.id,
            idHistoriaClinica: historia.id,
            usuarioAuditoria,
            transaccion,
          })

          return await this.cargarComentarioDetalle(
            comentarioSaved.id,
            transaccion
          )
        }
      )
    } finally {
      await this.comentarioArchivosService.limpiarTemporales(archivos)
    }

    this.comentarioGateway.emitirComentarioCreado(
      historia.id,
      comentarioFormateado
    )

    return comentarioFormateado
  }

  async responderComentario({
    comentarioDto,
    idComentarioPadre,
    usuarioAuditoria,
    actor,
    archivos,
  }: {
    comentarioDto: CrearComentarioDto
    idComentarioPadre: string
    usuarioAuditoria: string
    actor: ActorChat
    archivos: ComentarioArchivoTemporal[]
  }) {
    const comentarioPadre = await this.obtenerComentarioPorId(idComentarioPadre)
    const idHistoriaClinica =
      await this.obtenerHistoriaDesdeComentario(comentarioPadre)

    await this.validarAccesoAHistoria(idHistoriaClinica, actor)

    let comentarioFormateado: ComentarioChatDto
    try {
      comentarioFormateado = await this.comentarioRepositorio.runTransaction(
        async (transaccion) => {
          const comentarioSaved =
            await this.comentarioRepositorio.responderComentario({
              comentarioDto,
              idComentarioPadre,
              usuarioAuditoria,
              idUsuarioRol: actor.idUsuarioRol,
              idHistoriaClinica,
              transaccion,
            })

          await this.comentarioArchivosService.adjuntarArchivos({
            archivos,
            idComentario: comentarioSaved.id,
            idHistoriaClinica,
            usuarioAuditoria,
            transaccion,
          })

          return await this.cargarComentarioDetalle(
            comentarioSaved.id,
            transaccion
          )
        }
      )
    } finally {
      await this.comentarioArchivosService.limpiarTemporales(archivos)
    }

    this.comentarioGateway.emitirComentarioCreado(
      idHistoriaClinica,
      comentarioFormateado
    )

    return comentarioFormateado
  }

  async actualizar(
    idComentario: string,
    comentarioDto: CrearComentarioDto,
    usuarioAuditoria: string,
    actor: ActorChat
  ) {
    const comentario = await this.obtenerComentarioPorId(idComentario)
    const idHistoriaClinica =
      await this.obtenerHistoriaDesdeComentario(comentario)

    await this.validarAccesoAHistoria(idHistoriaClinica, actor)
    this.validarPropietarioComentario(comentario, actor)

    await this.comentarioRepositorio.actualizar(
      idComentario,
      comentarioDto,
      usuarioAuditoria
    )

    const comentarioFormateado =
      await this.cargarComentarioDetalle(idComentario)

    this.comentarioGateway.emitirComentarioActualizado(
      idHistoriaClinica,
      comentarioFormateado
    )

    return comentarioFormateado
  }

  async activar(idComentario: string, usuarioAuditoria: string) {
    const comentario = await this.obtenerComentarioPorId(idComentario)
    comentario.estado = Status.ACTIVE
    await this.comentarioRepositorio.actualizar(
      idComentario,
      comentario,
      usuarioAuditoria
    )
    return { id: idComentario, estado: comentario.estado }
  }

  async inactivar(
    idComentario: string,
    usuarioAuditoria: string,
    actor: ActorChat
  ) {
    const comentario = await this.obtenerComentarioPorId(idComentario)
    const idHistoriaClinica =
      await this.obtenerHistoriaDesdeComentario(comentario)

    await this.validarAccesoAHistoria(idHistoriaClinica, actor)
    this.validarPropietarioComentario(comentario, actor)

    comentario.estado = Status.INACTIVE
    await this.comentarioRepositorio.actualizar(
      idComentario,
      comentario,
      usuarioAuditoria
    )

    this.comentarioGateway.emitirComentarioEliminado(
      idHistoriaClinica,
      idComentario
    )

    return { id: idComentario, estado: comentario.estado }
  }

  async obtenerArchivoDescargable({
    idComentario,
    idArchivo,
    solicitante,
    idHistoriaClinica,
  }: {
    idComentario: string
    idArchivo: string
    solicitante: { idRol: string; idUsuarioRol: string }
    idHistoriaClinica?: string
  }): Promise<ComentarioArchivoDescarga> {
    if (!solicitante?.idRol || !solicitante?.idUsuarioRol) {
      throw new ForbiddenException(
        'No se pudo determinar el contexto del usuario para descargar el archivo adjunto.'
      )
    }

    const comentario = await this.obtenerComentarioPorId(idComentario)

    const historiaId = await this.obtenerHistoriaDesdeComentario(comentario)

    if (idHistoriaClinica && historiaId !== idHistoriaClinica) {
      throw new ForbiddenException(
        'El comentario solicitado no pertenece a la historia clínica indicada.'
      )
    }

    await this.validarAccesoAHistoria(historiaId, {
      idRol: solicitante.idRol,
      idUsuarioRol: solicitante.idUsuarioRol,
    })

    const archivo =
      await this.comentarioRepositorio.buscarArchivoPorId(idArchivo)
    if (!archivo || archivo.idComentario !== comentario.id) {
      throw new NotFoundException('Archivo adjunto no encontrado')
    }

    const rutaFinal =
      await this.comentarioArchivosService.obtenerRutaFinal(archivo)
    const mimeType = archivo.tipoArchivo ?? 'application/octet-stream'
    const nombreArchivo = archivo.nombreArchivo

    if (rutaFinal) {
      return {
        tipo: 'path',
        path: rutaFinal,
        nombreArchivo,
        mimeType,
      }
    }

    if (archivo.contenidoBase64) {
      return {
        tipo: 'buffer',
        buffer: Buffer.from(archivo.contenidoBase64, 'base64'),
        nombreArchivo,
        mimeType,
      }
    }

    throw new NotFoundException(
      'El archivo adjunto no tiene contenido disponible para descargar'
    )
  }

  async obtenerComentarioPorId(idComentario: string) {
    const comentario =
      await this.comentarioRepositorio.buscarPorId(idComentario)
    if (!comentario) {
      throw new NotFoundException(Messages.EXCEPTION_NOT_FOUND)
    }
    return comentario
  }

  async listarComentariosPaciente({
    idPaciente,
    paginacionQueryDto,
  }: {
    idPaciente: string
    paginacionQueryDto: PaginacionQueryDto
  }) {
    const paciente = await this.pacienteService.obtenerPaciente(idPaciente)

    const historiasClinicas =
      await this.historiaClinicaService.buscarPorPaciente(paciente.id)
    if (!historiasClinicas) {
      throw new NotFoundException(
        'No se encontraron historias clínicas para el paciente'
      )
    }
    return await this.listarPorRecurso({
      paginacionQueryDto,
      idHistoriaClinica: historiasClinicas.id,
      actor: {
        idRol: paciente.idRol,
        idUsuarioRol: paciente.id,
      },
    })
  }

  private formatearComentario(comentario: Comentario): ComentarioChatDto {
    const usuario = comentario.usuarioRol?.usuario
    const persona = usuario?.persona

    const comentarioDto: ComentarioChatDto = {
      id: comentario.id,
      contenido: comentario.contenido,
      fechaCreacion: comentario.fechaCreacion,
      idHistoriaClinica: comentario.idHistoriaClinica,
      idComentarioPadre: comentario.idComentarioPadre,
      usuario: {
        idUsuario: usuario?.id ?? '',
        idUsuarioRol: comentario.usuarioRol?.id ?? '',
        rol: comentario.usuarioRol?.rol?.rol,
        urlFoto: usuario?.urlFoto ?? null,
        nombres: persona?.nombres ?? null,
        primerApellido: persona?.primerApellido ?? null,
        segundoApellido: persona?.segundoApellido ?? null,
      },
    }

    if (comentario.archivos?.length) {
      comentarioDto.archivos = comentario.archivos.map((archivo) =>
        this.formatearArchivo(comentario, archivo)
      )
    }

    if (comentario.respuestas?.length) {
      comentarioDto.respuestas = comentario.respuestas.map((respuesta) =>
        this.formatearComentario(respuesta)
      )
    }

    return comentarioDto
  }

  private async validarAccesoAHistoria(
    idHistoriaClinica: string,
    actor: ActorChat,
    historiaClinica?: HistoriaClinica
  ): Promise<HistoriaClinica> {
    const historia =
      historiaClinica ??
      (await this.historiaClinicaService.obtenerHistoriaClinica(
        idHistoriaClinica
      ))

    if (actor.idRol === RolEnumId.ADMINISTRADOR) {
      return historia
    }

    if (actor.idRol === RolEnumId.PACIENTE) {
      if (historia.idPaciente !== actor.idUsuarioRol) {
        throw new ForbiddenException(
          'No tiene permisos para acceder a estos comentarios.'
        )
      }
      return historia
    }

    if (actor.idRol === RolEnumId.NUTRICIONISTA) {
      await this.asignacionService.validarAsignacion({
        idMedico: actor.idUsuarioRol,
        idPaciente: historia.idPaciente,
      })
      return historia
    }

    throw new ForbiddenException(
      'No tiene permisos para acceder a estos comentarios.'
    )
  }

  private async obtenerHistoriaDesdeComentario(
    comentario: Comentario
  ): Promise<string> {
    if (comentario.idHistoriaClinica) {
      return comentario.idHistoriaClinica
    }

    if (comentario.idComentarioPadre) {
      const comentarioPadre = await this.obtenerComentarioPorId(
        comentario.idComentarioPadre
      )
      return this.obtenerHistoriaDesdeComentario(comentarioPadre)
    }

    throw new NotFoundException(
      'El comentario no está asociado a una historia clínica.'
    )
  }

  private validarPropietarioComentario(
    comentario: Comentario,
    actor: ActorChat
  ) {
    if (actor.idRol === RolEnumId.ADMINISTRADOR) {
      return
    }

    if (comentario.idUsuarioRol !== actor.idUsuarioRol) {
      throw new ForbiddenException(
        'Solo puede modificar o eliminar sus propios comentarios.'
      )
    }
  }

  private formatearArchivo(
    comentario: Comentario,
    archivo: ArchivoAdjunto
  ): ComentarioArchivoChatDto {
    const tamanoBytes = archivo.metadatos?.tamanoBytes ?? null
    const urlDescarga = `/comentarios/${comentario.id}/archivos/${archivo.id}`
    const metadatos = archivo.metadatos as
      | (ArchivoAdjuntoMetadataResponse & { ruta?: string })
      | undefined

    return {
      id: archivo.id,
      nombreArchivo: archivo.nombreArchivo,
      tipoArchivo: archivo.tipoArchivo,
      tamanoBytes,
      urlDescarga,
      metadatos: metadatos ?? null,
      fechaCreacion: archivo.fechaCreacion,
    }
  }

  private async cargarComentarioDetalle(
    idComentario: string,
    transaccion?: EntityManager
  ) {
    const comentario = await this.comentarioRepositorio.obtenerDetalle(
      idComentario,
      transaccion
    )
    if (!comentario) {
      throw new NotFoundException(Messages.EXCEPTION_NOT_FOUND)
    }
    return this.formatearComentario(comentario)
  }
}
