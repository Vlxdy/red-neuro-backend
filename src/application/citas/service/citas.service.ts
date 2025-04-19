import { BaseService } from '@/common/base/base-service'
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UsuariosRegistradosService } from '@/application/usuarios-registrado/service/usuarios-registrados.service'
import { CitasRepository } from '../repository/citas.repository'
import {
  ActualizarCitaDto,
  CrearCitaDto,
  RespuestaCita,
} from '../dto/citas.dto'
import { RolEnumId } from '@/core/authorization/rol.enum'
import { Cita } from '../entity/cita.entity'

@Injectable()
export class CitasService extends BaseService {
  constructor(
    @Inject(CitasRepository)
    private citasRepositorio: CitasRepository,
    private usuariosRegistradosService: UsuariosRegistradosService
  ) {
    super()
  }

  async listarCitas({
    idUsuarioRol,
    idRol,
  }: {
    idUsuarioRol: string
    idRol: string
  }) {
    if (idRol === RolEnumId.PACIENTE) {
      const [citas, cantidad] = await this.citasRepositorio.listarPorPaciente({
        idUsuarioRol,
      })
      return [this.formatarCitas(citas), cantidad]
    } else if (idRol === RolEnumId.NUTRICIONISTA) {
      const [citas, cantidad] =
        await this.citasRepositorio.listarPorNutricionista({
          idUsuarioRol,
        })
      return [this.formatarCitas(citas), cantidad]
    }
    throw new ForbiddenException(
      'No tiene permiso para acceder a esta información'
    )
  }

  async crearCita(
    idMedico: string,
    data: CrearCitaDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<{ id: string }> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearCita(
          idMedico,
          data,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }

      return await this.citasRepositorio.runTransaction(op)
    }

    await this.usuariosRegistradosService.obtenerMedico(idMedico, transaccion)
    await this.usuariosRegistradosService.obtenerPaciente(
      data.idPaciente,
      transaccion
    )

    const asignacion = await this.citasRepositorio.crear({
      idMedico,
      data,
      usuarioAuditoria,
      transaccion,
    })
    return { id: asignacion.id }
  }

  async actualizarCita({
    idCita,
    data,
    idMedico,
    usuarioAuditoria,
    transaccion,
  }: {
    idCita: string
    idMedico: string
    data: ActualizarCitaDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.actualizarCita({
          idCita,
          data,
          idMedico,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }

      return await this.citasRepositorio.runTransaction(op)
    }

    const cita = await this.citasRepositorio.buscarPorId(idCita, transaccion)
    if (!cita) {
      throw new NotFoundException('Cita no encontrada')
    }
    if (idMedico !== cita.idMedico) {
      throw new ForbiddenException(
        'No tiene permiso para acceder a esta información'
      )
    }

    const { idPaciente, detalle, fechaFin, fechaInicio } = data

    if (idPaciente) {
      await this.usuariosRegistradosService.obtenerPaciente(
        idPaciente,
        transaccion
      )
    }

    const citaUpdate = await this.citasRepositorio.actualizar({
      datosDto: {
        idPaciente,
        detalle,
        fechaFin,
        fechaInicio,
      },
      id: idCita,
      usuarioAuditoria,
    })
    return citaUpdate
  }

  async buscarPorId(id: string, transaccion?: EntityManager) {
    const cita = await this.citasRepositorio.buscarPorId(id, transaccion)
    if (!cita) {
      throw new NotFoundException('Cita no encontrada')
    }
    return cita
  }

  formatarCitas(citas: Cita[]) {
    return citas.map((cita) => this.formatarRespuestaCita(cita))
  }

  formatarRespuestaCita(cita: Cita): RespuestaCita {
    return {
      id: cita.id,
      detalle: cita.detalle,
      fechaInicio: cita.fechaInicio,
      fechaFin: cita.fechaFin,
      estado: cita.estado,
      paciente: cita.paciente
        ? {
            id: cita.paciente.id,
            nombres: cita.paciente.usuario.persona.nombres,
            urlFoto: cita.paciente.usuario.urlFoto,
            primerApellido: cita.paciente.usuario.persona.primerApellido,
            segundoApellido: cita.paciente.usuario.persona.segundoApellido,
            nroDocumento: cita.paciente.usuario.persona.nroDocumento,
          }
        : null,
      medico: cita.medico
        ? {
            id: cita.medico.id,
            nombres: cita.medico.usuario.persona.nombres,
            urlFoto: cita.medico.usuario.urlFoto,
            primerApellido: cita.medico.usuario.persona.primerApellido,
            segundoApellido: cita.medico.usuario.persona.segundoApellido,
            nroDocumento: cita.medico.usuario.persona.nroDocumento,
          }
        : null,
    }
  }
}
