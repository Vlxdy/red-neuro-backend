import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { RolEnum } from '@/core/authorization/rol.enum'
import { Messages } from '@/common/constants/response-messages'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { UsuariosRegistradosRepository } from '../repository/usuarios-registrados.repository'
import { UsuariosRegistradosResponse } from '../dto/usuarios-registrados.dto'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Persona } from '@/core/usuario/entity/persona.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'

interface UsuarioRolResponse {
  id: string
  nombres: string
  primerApellido?: string | null
  segundoApellido?: string | null
  nroDocumento: string
  tipoDocumento: string
  genero?: string | null
  correoElectronico?: string | null
  estado: string
}
@Injectable()
export class UsuariosRegistradosService extends BaseService {
  constructor(
    @Inject(UsuarioRolRepository)
    private usuarioRolRepositorio: UsuarioRolRepository,
    private usuarioRegistradoRepositorio: UsuariosRegistradosRepository
  ) {
    super()
  }

  async obtenerMedico(idUsuarioRol: string, transaccion?: EntityManager) {
    const usuarioRol = await this.usuarioRolRepositorio.buscarPorId(
      idUsuarioRol,
      transaccion
    )
    if (!usuarioRol) {
      throw new NotFoundException(Messages.MEDICO_NOT_FOUND)
    }
    if (usuarioRol.rol.rol === RolEnum.NUTRICIONISTA) return usuarioRol
    throw new NotFoundException(Messages.MEDICO_NOT_FOUND)
  }

  async obtenerPaciente(idUsuarioRol: string, transaccion?: EntityManager) {
    const usuarioRol = await this.usuarioRolRepositorio.buscarPorId(
      idUsuarioRol,
      transaccion
    )
    if (!usuarioRol) {
      throw new NotFoundException(Messages.PACIENTE_NOT_FOUND)
    }
    if (usuarioRol.rol.rol === RolEnum.PACIENTE) return usuarioRol
    throw new NotFoundException(Messages.PACIENTE_NOT_FOUND)
  }

  async listarUsuariosPorRol(params: PaginacionQueryDto, rol: RolEnum) {
    const usuarios =
      await this.usuarioRegistradoRepositorio.listarUsuariosPorRol(params, rol)

    const usuariosResponse = usuarios[0].map((usuario) => {
      return {
        id: usuario.usuarioRol[0].id,
        nombres: usuario.persona.nombres,
        primerApellido: usuario.persona.primerApellido,
        segundoApellido: usuario.persona.segundoApellido,
        nroDocumento: usuario.persona.nroDocumento,
        tipoDocumento: usuario.persona.tipoDocumento,
        genero: usuario.persona.genero,
        correoElectronico: usuario.correoElectronico,
        estado: usuario.usuarioRol[0].estado,
      }
    })

    return [usuariosResponse, usuarios[1]]
  }
  async listarPacientePorMedico(
    params: PaginacionQueryDto,
    idMedico: string
  ): Promise<[UsuariosRegistradosResponse[], number]> {
    const [usuariosRol, total] =
      await this.usuarioRegistradoRepositorio.listarPacientesPorMedico(
        idMedico,
        params
      )

    return [this.formatearUsuarioRolRespuesta(usuariosRol), total]
  }

  async listarPacientesPorAsignar({
    idMedico,
    params,
  }: {
    params: PaginacionQueryDto
    idMedico: string
  }) {
    const filtro = new PaginacionQueryDto()
    const [usuariosPaciente] =
      await this.usuarioRegistradoRepositorio.listarPacientesPorMedico(
        idMedico,
        filtro,
        true
      )

    const idPacientesAsignados = usuariosPaciente.map(
      (usuarioRol) => usuarioRol.id
    )
    // TODO: corregir limite de obtencion de datos
    const [uduarios, total] =
      await this.usuarioRegistradoRepositorio.listarPacientesPorAsignar({
        idPacientesOmitir: [idMedico, ...idPacientesAsignados],
        params,
      })

    const inicio = params.saltar
    const fin = inicio + params.limite
    return [
      this.formatearUsuarioRolRespuesta(
        this.convertirRawUsuarioRol(uduarios.slice(inicio, fin))
      ),
      total,
    ]
  }

  convertirRawUsuarioRol(usuarioRoles: any[]): UsuarioRol[] {
    return usuarioRoles.map((usuarioRol) => {
      const persona = new Persona({
        estado: usuarioRol.persona__estado,
        transaccion: usuarioRol.persona__transaccion,
        usuarioCreacion: usuarioRol.persona__usuario_creacion,
        fechaCreacion: usuarioRol.persona__fecha_creacion,
        usuarioModificacion: usuarioRol.persona__usuario_modificacion,
        fechaModificacion: usuarioRol.persona__fecha_modificacion,
        id: usuarioRol.persona_id,
        uuidCiudadano: usuarioRol.persona_uuid_ciudadano,
        nombres: usuarioRol.persona_nombres,
        primerApellido: usuarioRol.persona_primer_apellido,
        segundoApellido: usuarioRol.persona_segundo_apellido,
        tipoDocumento: usuarioRol.persona_tipo_documento,
        tipoDocumentoOtro: usuarioRol.persona_tipo_documento_otro,
        nroDocumento: usuarioRol.persona_nro_documento,
        fechaNacimiento: usuarioRol.persona_fecha_nacimiento,
        telefono: usuarioRol.persona_telefono,
        genero: usuarioRol.persona_genero,
        observacion: usuarioRol.persona_observacion,
      })
      const usuario = new Usuario({
        estado: usuarioRol.usuario__estado,
        transaccion: usuarioRol.usuario__transaccion,
        usuarioCreacion: usuarioRol.usuario__usuario_creacion,
        fechaCreacion: usuarioRol.usuario__fecha_creacion,
        usuarioModificacion: usuarioRol.usuario__usuario_modificacion,
        fechaModificacion: usuarioRol.usuario__fecha_modificacion,
        id: usuarioRol.usuario_id,
        usuario: usuarioRol.usuario_usuario,
        // contrasena: usuarioRol.usuario_contrasena,
        ciudadaniaDigital: usuarioRol.usuario_ciudadania_digital,
        correoElectronico: usuarioRol.usuario_correo_electronico,
        intentos: usuarioRol.usuario_intentos,
        codigoDesbloqueo: usuarioRol.usuario_codigo_desbloqueo,
        codigoRecuperacion: usuarioRol.usuario_codigo_recuperacion,
        codigoTransaccion: usuarioRol.usuario_codigo_transaccion,
        codigoActivacion: usuarioRol.usuario_codigo_activacion,
        fechaBloqueo: usuarioRol.usuario_fecha_bloqueo,
        urlFoto: usuarioRol.usuario_url_foto,
        persona,
      })

      return new UsuarioRol({
        id: usuarioRol.id,
        estado: usuarioRol._estado,
        usuario,

        // id: usuarioRol.id,
        // nombres: usuarioRol.persona.nombres,
        // primerApellido: usuarioRol.persona.primerApellido,
        // segundoApellido: usuarioRol.persona.segundoApellido,
        // nroDocumento: usuarioRol.persona.nroDocumento,
        // tipoDocumento: usuarioRol.persona.tipoDocumento,
        // genero: usuarioRol.persona.genero,
        // correoElectronico: usuarioRol.correoElectronico,
        // estado: usuarioRol.estado,
      })
    })
  }
  formatearUsuarioRolRespuesta(
    usuariosRol: UsuarioRol[]
  ): Array<UsuarioRolResponse> {
    const data: Array<UsuarioRolResponse> = []
    usuariosRol.forEach((usuarioRol) => {
      data.push({
        id: usuarioRol.id,
        nombres: usuarioRol.usuario.persona.nombres,
        primerApellido: usuarioRol.usuario.persona.primerApellido,
        segundoApellido: usuarioRol.usuario.persona.segundoApellido,
        nroDocumento: usuarioRol.usuario.persona.nroDocumento,
        tipoDocumento: usuarioRol.usuario.persona.tipoDocumento,
        genero: usuarioRol.usuario.persona.genero,
        correoElectronico: usuarioRol.usuario.correoElectronico,
        estado: usuarioRol.estado,
      })
    })
    return data
  }
}
