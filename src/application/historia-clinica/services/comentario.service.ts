import { BaseService } from '../../../common/base'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { Messages } from '../../../common/constants/response-messages'
import { Status } from '../../../common/constants'
import { PaginacionQueryDto } from '../../../common/dto/paginacion-query.dto'
import { ComentarioRepository } from '../repositories/comentario.repository'
import { CrearComentarioDto } from '../dtos/comentario.dto'
import { PacientesService } from '@/application/gestion-pacientes/services/pacientes.service'
import { HistoriaClinicaService } from './historia-clinico.service'

@Injectable()
export class ComentarioService extends BaseService {
  constructor(
    @Inject(ComentarioRepository)
    private comentarioRepositorio: ComentarioRepository,
    private readonly pacienteService: PacientesService,
    private readonly historiaClinicaService: HistoriaClinicaService
  ) {
    super()
  }

  async listarPorRecurso(
    paginacionQueryDto: PaginacionQueryDto,
    idHistoriaClinica: string
  ): Promise<[Array<object>, number]> {
    const resultado = await this.comentarioRepositorio.listarPorRecurso(
      paginacionQueryDto,
      idHistoriaClinica
    )

    const comentariosDto = resultado[0].map((comentario) => {
      const { usuarioRol, respuestas } = comentario
      const { id, urlFoto, persona } = usuarioRol.usuario
      const { nombres, primerApellido, segundoApellido } = persona

      const respuestasDto = respuestas.map((res) => {
        const { usuarioRol } = res
        const { id, urlFoto, persona } = usuarioRol.usuario
        const { nombres, primerApellido, segundoApellido } = persona
        return {
          ...res,
          usuario: {
            idUsuario: id,
            urlFoto,
            nombres,
            primerApellido,
            segundoApellido,
          },
        }
      })

      return {
        ...comentario,
        respuestas: respuestasDto,
        usuario: {
          idUsuario: id,
          urlFoto,
          nombres,
          primerApellido,
          segundoApellido,
        },
      }
    })

    return [comentariosDto, resultado[1]]
  }

  async crear({
    comentarioDto,
    idHistoriaClinica,
    idUsuarioRol,
    usuarioAuditoria,
  }: {
    comentarioDto: CrearComentarioDto
    idHistoriaClinica: string
    idUsuarioRol: string
    usuarioAuditoria: string
  }) {
    let comentarioSaved
    try {
      comentarioSaved = await this.comentarioRepositorio.crearPorRecurso({
        idUsuarioRol,
        idHistoriaClinica,
        comentarioDto,
        usuarioAuditoria,
      })
    } catch (error) {
      throw new NotFoundException(Messages.EXCEPTION_NOT_FOUND)
    }
    return comentarioSaved
  }

  async responderComentario({
    comentarioDto,
    idComentarioPadre,
    idUsuarioRol,
    usuarioAuditoria,
  }: {
    comentarioDto: CrearComentarioDto
    idComentarioPadre: string
    idUsuarioRol: string
    usuarioAuditoria: string
  }) {
    await this.obtenerComentarioPorId(idComentarioPadre)
    const comentarioSaved =
      await this.comentarioRepositorio.responderComentario({
        comentarioDto,
        idComentarioPadre,
        usuarioAuditoria,
        idUsuarioRol,
      })
    return comentarioSaved
  }

  async actualizar(
    idComentario: string,
    comentarioDto: CrearComentarioDto,
    usuarioAuditoria: string
  ) {
    await this.obtenerComentarioPorId(idComentario)
    await this.comentarioRepositorio.actualizar(
      idComentario,
      comentarioDto,
      usuarioAuditoria
    )
    return { id: idComentario }
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

  async inactivar(idComentario: string, usuarioAuditoria: string) {
    const comentario = await this.obtenerComentarioPorId(idComentario)
    comentario.estado = Status.INACTIVE
    await this.comentarioRepositorio.actualizar(
      idComentario,
      comentario,
      usuarioAuditoria
    )
    return { id: idComentario, estado: comentario.estado }
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
    return await this.listarPorRecurso(paginacionQueryDto, historiasClinicas.id)
  }
}
