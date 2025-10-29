import { BaseService } from '@/common/base/base-service'
import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { PacientesService } from '@/application/gestion-pacientes/services/pacientes.service'
import { CitasRepository } from '../repositories/citas.repository'
import {
  ActualizarCitaDto,
  CrearCitaDto,
} from '../../gestion-pacientes/dto/citas.dto'
import { RolEnumId } from '@/core/authorization/rol.enum'
import { MedicosService } from './medicos.service'
import { Cita } from '../entities/cita.entity'
import { CitasEstado } from '../constant'
import { CitaResponse } from '@/common/types/data-response.type'
import { formatearUsuarioRolRespuesta } from '../utils/formateos'
import { NotificacionService } from './notificacion.service'
import dayjs, { Dayjs } from 'dayjs'
import { NotificacionTipo } from '../entities/notificacion.entity'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { AsignacionService } from './asignacion.service'

@Injectable()
export class CitasService extends BaseService {
  constructor(
    @Inject(CitasRepository)
    private citasRepositorio: CitasRepository,
    private medicosService: MedicosService,
    @Inject(forwardRef(() => PacientesService))
    private pacientesService: PacientesService,
    private asignacionService: AsignacionService,
    private notificacionService: NotificacionService
  ) {
    super()
  }

  async listarCitas({
    idUsuarioRol,
    idRol,
    fechaInicio,
    fechaFin,
  }: {
    idUsuarioRol: string
    idRol: string
    fechaInicio?: string
    fechaFin?: string
  }) {
    const fechaInicioParseada = fechaInicio ? dayjs(fechaInicio) : null
    const fechaFinParseada = fechaFin ? dayjs(fechaFin) : null

    if (fechaInicioParseada && !fechaInicioParseada.isValid()) {
      throw new BadRequestException('La fecha de inicio no es válida')
    }

    if (fechaFinParseada && !fechaFinParseada.isValid()) {
      throw new BadRequestException('La fecha fin no es válida')
    }

    let fechaInicioConsulta: Dayjs
    let fechaFinConsulta: Dayjs

    if (!fechaInicioParseada && !fechaFinParseada) {
      const ahora = dayjs()
      fechaInicioConsulta = ahora.startOf('month')
      fechaFinConsulta = ahora.endOf('month')
    } else {
      const fechaInicioBase = fechaInicioParseada || fechaFinParseada!
      const fechaFinBase = fechaFinParseada || fechaInicioParseada!
      fechaInicioConsulta = fechaInicioBase.startOf('day')
      fechaFinConsulta = fechaFinBase.endOf('day')
    }

    if (fechaInicioConsulta.isAfter(fechaFinConsulta)) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior o igual a la fecha fin'
      )
    }

    const fechaInicioBusqueda = fechaInicioConsulta.toDate()
    const fechaFinBusqueda = fechaFinConsulta.toDate()

    if (idRol === RolEnumId.PACIENTE) {
      const [citas, cantidad] = await this.citasRepositorio.listarPorPaciente({
        idUsuarioRol,
        fechaInicio: fechaInicioBusqueda,
        fechaFin: fechaFinBusqueda,
      })

      return [this.formatearCitas(citas), cantidad]
    } else if (idRol === RolEnumId.NUTRICIONISTA) {
      const [citas, cantidad] =
        await this.citasRepositorio.listarPorNutricionista({
          idUsuarioRol,
          fechaInicio: fechaInicioBusqueda,
          fechaFin: fechaFinBusqueda,
        })
      return [this.formatearCitas(citas), cantidad]
    }
    throw new ForbiddenException(
      'No tiene permiso para acceder a esta información'
    )
  }

  async listarCitasPorPaciente({
    idPaciente,
    estado,
    transaccion,
  }: {
    idPaciente: string
    estado?: CitasEstado
    transaccion?: EntityManager
  }) {
    const [citas] = await this.citasRepositorio.listarPorPaciente({
      idUsuarioRol: idPaciente,
      estado,
      transaccion,
    })
    return citas
  }

  async crearCita({
    data,
    idMedico,
    usuarioAuditoria,
    transaccion,
  }: {
    // idRol: string
    idMedico: string
    data: CrearCitaDto
    usuarioAuditoria: string
    transaccion?: EntityManager
  }): Promise<{ id: string }> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearCita({
          data,
          idMedico,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }

      return await this.citasRepositorio.runTransaction(op)
    }

    await this.medicosService.obtenerMedico(idMedico, transaccion)
    await this.pacientesService.obtenerPaciente(data.idPaciente, transaccion)

    await this.asignacionService.validarAsignacion({
      idMedico,
      idPaciente: data.idPaciente,
      transaccion,
    })

    const cita = await this.citasRepositorio.crear({
      idMedico,
      data,
      usuarioAuditoria,
      transaccion,
    })

    return { id: cita.id }
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
    // TODO: verificar si el medico tiene permiso para actualizar la cita
    // if (idMedico !== cita.idMedico) {
    //   throw new ForbiddenException(
    //     'No tiene permiso para acceder a esta información'
    //   )
    // }

    const { idPaciente, detalle, fechaFin, fechaInicio, estado } = data

    if (idPaciente) {
      await this.pacientesService.obtenerPaciente(idPaciente, transaccion)
    }

    const citaUpdate = await this.citasRepositorio.actualizar({
      datosDto: { idPaciente, detalle, estado, fechaFin, fechaInicio },
      id: idCita,
      usuarioAuditoria,
      transaccion,
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

  async eliminarCita({
    id,
    idMedico,
    usuarioAuditoria,
    transaccion,
  }: {
    id: string
    idMedico: string
    usuarioAuditoria: string
    transaccion?: EntityManager
  }): Promise<void> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.eliminarCita({
          id,
          idMedico,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }

      return await this.citasRepositorio.runTransaction(op)
    }

    const cita = await this.citasRepositorio.buscarPorId(id, transaccion)
    if (!cita) {
      throw new NotFoundException('Cita no encontrada')
    }
    if (idMedico !== cita.idMedico) {
      throw new ForbiddenException(
        'No tiene permiso para acceder a esta información'
      )
    }
    await this.citasRepositorio.actualizar({
      datosDto: { estado: CitasEstado.INACTIVO },
      id,
      usuarioAuditoria: idMedico,
    })
  }

  async revisarCita(usuarioAuditoria: string, transaccion?: EntityManager) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.revisarCita(usuarioAuditoria, nuevaTransaccion)
      }
      return await this.citasRepositorio.runTransaction(op)
    }
    const citas = await this.citasRepositorio.listarCitasPendientes(transaccion)
    const ahora = dayjs()
    this.logger.info(`Revisando ${citas.length} citas pendientes`)
    const pasadas: Cita[] = []
    const proximas: Cita[] = []
    for (const cita of citas) {
      const fechaCita = dayjs(cita.fechaInicio)
      if (fechaCita.isBefore(ahora)) {
        pasadas.push(cita)
      } else if (fechaCita.diff(ahora, 'hour') <= 48) {
        proximas.push(cita)
      }
    }
    this.logger.info(`Citas pasadas: ${pasadas.length},`)
    if (pasadas.length > 0) {
      this.logger.info(
        `Hay ${pasadas.length} citas pasadas que no han sido atendidas`
      )
      for (const cita of pasadas) {
        await this.notificacionService.crear({
          idPaciente: cita.idPaciente,
          idMedico: cita.idMedico,
          tipo: NotificacionTipo.CITA_NO_ASISTIO,
          mensaje: `La cita programada para el ${dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')} no ha sido atendida, por favor, comuníquese con el médico para reprogramar.`,
          transaction: transaccion,
          usuarioAuditoria: usuarioAuditoria,
        })
        await this.actualizarCita({
          idCita: cita.id,
          data: { estado: CitasEstado.NO_ASISTIO },
          usuarioAuditoria: cita.idMedico,
          idMedico: cita.idMedico,
        })
      }
    }
    if (proximas.length > 0) {
      this.logger.info(
        `Hay ${proximas.length} citas próximas que deben ser notificadas`
      )
      for (const cita of proximas) {
        const notificacion = cita.notificacion.find(
          (notificacion) =>
            notificacion.tipo === NotificacionTipo.CITA_PROXIMAMENTE
        )
        if (!notificacion)
          await this.notificacionService.crear({
            idPaciente: cita.idPaciente,
            idMedico: cita.idMedico,
            usuarioAuditoria: usuarioAuditoria,
            tipo: NotificacionTipo.CITA_PROXIMAMENTE,
            mensaje: `La cita programada para el ${dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')} está próxima, por favor, tome en cuenta la fecha y hora.`,
            transaction: transaccion,
          })
      }
    }
  }

  async obtenerCitasPorPacientePaginado({
    idPaciente,
    paginacion,
  }: {
    idPaciente: string
    paginacion: PaginacionQueryDto
  }): Promise<[CitaResponse[], number]> {
    const [citas, total] =
      await this.citasRepositorio.listarPorPacientePaginado({
        idPaciente,
        paginacion,
      })
    return [this.formatearCitas(citas), total]
  }

  formatearCitas(citas: Cita[]) {
    return citas.map((cita) => this.formatearRespuestaCita(cita))
  }

  formatearRespuestaCita(cita: Cita): CitaResponse {
    return {
      id: cita.id,
      detalle: cita.detalle,
      fechaInicio: cita.fechaInicio,
      fechaFin: cita.fechaFin,
      estado: cita.estado,
      paciente: formatearUsuarioRolRespuesta(cita.paciente),
      medico: cita.medico ? formatearUsuarioRolRespuesta(cita.medico) : null,
    }
  }
}
