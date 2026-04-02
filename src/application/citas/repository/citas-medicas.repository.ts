import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import {
  DataSource,
  EntityManager,
  In,
  LessThan,
  SelectQueryBuilder,
} from 'typeorm'
import { Cita } from '../entities/cita.entity'
import { CitasEstado, TipoCita } from '../constants'
import { RolEnum } from '@/core/authorization/rol.enum'
import {
  ActualizarEstadoCitaDto,
  CancelarCitaDto,
  FiltrosCitaDto,
  FiltrosCitaPaginadoDto,
  ReprogramarCitaDto,
} from '../dto/cita.dto'
import { Servicio } from '@/application/servicio/entities/servicio.entity'
import {
  Notificacion,
  NotificacionTipo,
  TipoActualizacion,
} from '../entities/notificacion.entity'
import { HistorialCitasRepository } from './historial-citas.repository'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { FiltrosCitasPacientePaginadoDto } from '@/application/paciente/dto/paciente.dto'

@Injectable()
export class CitasMedicasRepository {
  private esRolRestringidoASusPropiasCitas(rol?: string) {
    return rol === RolEnum.PROFESIONAL_INVITADO
  }

  private aplicarRestriccionPorRol(
    query: SelectQueryBuilder<Cita>,
    rol?: string,
    idUsuarioSolicitante?: string
  ) {
    if (this.esRolRestringidoASusPropiasCitas(rol) && idUsuarioSolicitante) {
      query.andWhere('cita.idPersonal = :idUsuarioSolicitante', {
        idUsuarioSolicitante,
      })
    }
  }
  constructor(
    private readonly dataSource: DataSource,
    private readonly historialRepository: HistorialCitasRepository
  ) {}

  private citaRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Cita)
  }

  private notificacionRepository(manager?: EntityManager) {
    return (manager ?? this.dataSource).getRepository(Notificacion)
  }

  private construirMensajeCitaSolicitada(data: {
    asignadoPor?: string
    fechaInicio?: Date | null
    tipoCita?: TipoCita
    detalle?: string
    nombreServicio?: string | null
  }): string {
    const asignadoPor = data.asignadoPor || 'personal de salud'
    const fechaTexto = data.fechaInicio
      ? dayjs(data.fechaInicio).format('DD/MM/YYYY HH:mm')
      : 'hora por confirmar'
    const tipoTexto =
      data.tipoCita === TipoCita.ESTUDIO ? 'Estudio' : 'Consulta'
    const servicio = data.nombreServicio ? ` (${data.nombreServicio})` : ''
    const detalle = data.detalle ? ` Detalle: ${data.detalle}.` : ''

    return `${asignadoPor} te asignó una ${tipoTexto}${servicio} para ${fechaTexto}.${detalle}`
  }

  private construirMensajeNoAsistio(cita: Cita): string {
    const fechaTexto = cita.fechaInicio
      ? dayjs(cita.fechaInicio).format('DD/MM/YYYY HH:mm')
      : 'hora registrada'
    const tipoTexto =
      cita.tipoCita === TipoCita.ESTUDIO ? 'Estudio' : 'Consulta'
    const servicio = cita.servicio?.nombre ? ` (${cita.servicio.nombre})` : ''
    const detalle = cita.detalle ? ` Detalle: ${cita.detalle}.` : ''

    return `La ${tipoTexto}${servicio} programada para ${fechaTexto} fue marcada como no asistida.${detalle}`
  }

  buildCitasQuery(
    filtros: Partial<FiltrosCitaDto | FiltrosCitaPaginadoDto> = {},
    idUsuarioSolicitante?: string,
    manager?: EntityManager,
    rolSolicitante?: string,
    incluirEstadosOcultos = false
  ): SelectQueryBuilder<Cita> {
    const query = this.citaRepository(manager)
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.personal', 'personal')
      .leftJoinAndSelect('personal.persona', 'personaPersonal')
      .leftJoinAndSelect('cita.paciente', 'paciente')
      .leftJoinAndSelect('cita.consultorio', 'consultorio')
      .leftJoinAndSelect('cita.lugar', 'lugar')
      .leftJoinAndSelect('cita.servicio', 'servicio')
      .leftJoinAndSelect('cita.citaNueva', 'citaNueva')
      .leftJoinAndSelect('citaNueva.personal', 'citaNuevaPersonal')
      .leftJoinAndSelect(
        'citaNuevaPersonal.persona',
        'citaNuevaPersonaPersonal'
      )
      .leftJoinAndSelect('citaNueva.paciente', 'citaNuevaPaciente')
      .leftJoinAndSelect('citaNueva.consultorio', 'citaNuevaConsultorio')
      .leftJoinAndSelect('citaNueva.lugar', 'citaNuevaLugar')
      .leftJoinAndSelect('citaNueva.servicio', 'citaNuevaServicio')
      .leftJoinAndSelect('cita.usuarioProgramo', 'usuarioProgramo')
      .leftJoinAndSelect('usuarioProgramo.persona', 'usuarioProgramoPersona')
      .leftJoinAndSelect('cita.usuarioEnvio', 'usuarioEnvio')
      .leftJoinAndSelect('usuarioEnvio.persona', 'usuarioEnvioPersona')
      .distinct(true)

    if (filtros.fechaInicio) {
      query.andWhere('cita.fechaInicio >= :fechaInicio', {
        fechaInicio: filtros.fechaInicio,
      })
    }

    if (filtros.fechaFin) {
      query.andWhere('cita.fechaFin <= :fechaFin', {
        fechaFin: filtros.fechaFin,
      })
    }

    const estadosRestringidos = [CitasEstado.RECHAZADA]
    const incluirRestringidasProgramadasPorSolicitante =
      Boolean(filtros.idPersonal) &&
      Boolean(idUsuarioSolicitante) &&
      filtros.idPersonal === idUsuarioSolicitante

    if (filtros.idPersonal) {
      if (
        incluirRestringidasProgramadasPorSolicitante &&
        (!filtros.estado || estadosRestringidos.includes(filtros.estado))
      ) {
        query.andWhere(
          '(cita.idPersonal = :idPersonal OR (cita.estado IN (:...estadosRestringidos) AND cita.idUsuarioProgramo = :idUsuarioSolicitante))',
          {
            idPersonal: filtros.idPersonal,
            estadosRestringidos,
            idUsuarioSolicitante,
          }
        )
      } else {
        query.andWhere('cita.idPersonal = :idPersonal', {
          idPersonal: filtros.idPersonal,
        })
      }
    }

    if (filtros.idLugar) {
      query.andWhere('cita.idLugar = :idLugar', {
        idLugar: filtros.idLugar,
      })
    }

    if (filtros.estado) {
      query.andWhere('cita.estado = :estado', {
        estado: filtros.estado,
      })

      if (
        idUsuarioSolicitante &&
        estadosRestringidos.includes(filtros.estado)
      ) {
        if (incluirRestringidasProgramadasPorSolicitante) {
          query.andWhere(
            '(cita.idPersonal = :idPersonal OR cita.idUsuarioProgramo = :idUsuarioSolicitante)',
            {
              idPersonal: filtros.idPersonal,
              idUsuarioSolicitante,
            }
          )
        } else {
          query.andWhere('cita.idUsuarioProgramo = :idUsuarioSolicitante', {
            idUsuarioSolicitante,
          })
        }
      }
    } else if (!incluirEstadosOcultos) {
      query
        .andWhere('cita.estado != :estadoInactivo', {
          estadoInactivo: CitasEstado.INACTIVO,
        })
        .andWhere('cita.estado != :estadoReprogramada', {
          estadoReprogramada: CitasEstado.REPROGRAMADA,
        })
        .andWhere('cita.estado != :estadoCancelada', {
          estadoCancelada: CitasEstado.CANCELADA,
        })

      if (idUsuarioSolicitante) {
        query.andWhere(
          '(cita.estado NOT IN (:...estadosRestringidos) OR cita.idUsuarioProgramo = :idUsuarioSolicitante)',
          {
            estadosRestringidos,
            idUsuarioSolicitante,
          }
        )
      }
    }

    if (idUsuarioSolicitante) {
      query.andWhere(
        '(cita.estado != :estadoBorrador OR cita.idUsuarioProgramo = :idUsuarioSolicitanteBorrador)',
        {
          estadoBorrador: CitasEstado.BORRADOR,
          idUsuarioSolicitanteBorrador: idUsuarioSolicitante,
        }
      )
    } else if (!incluirEstadosOcultos) {
      query.andWhere('cita.estado != :estadoBorrador', {
        estadoBorrador: CitasEstado.BORRADOR,
      })
    }

    this.aplicarRestriccionPorRol(query, rolSolicitante, idUsuarioSolicitante)

    return query
  }

  async listarCitas(
    filtros: FiltrosCitaDto,
    idUsuarioSolicitante?: string,
    rolSolicitante?: string
  ) {
    return await this.buildCitasQuery(
      filtros,
      idUsuarioSolicitante,
      undefined,
      rolSolicitante
    ).getMany()
  }

  async listarCitasPaginadas(
    filtros: FiltrosCitaPaginadoDto,
    idUsuarioSolicitante?: string,
    rolSolicitante?: string
  ) {
    const { limite, saltar } = filtros
    return await this.buildCitasQuery(
      filtros,
      idUsuarioSolicitante,
      undefined,
      rolSolicitante
    )
      .take(limite)
      .skip(saltar)
      .getManyAndCount()
  }

  async listarCitasPacientePaginado(
    idPaciente: string,
    filtros: FiltrosCitasPacientePaginadoDto,
    idPersonalAsignado?: string
  ) {
    const { limite, saltar } = filtros

    const query = this.buildCitasQuery(
      {},
      undefined,
      undefined,
      undefined,
      true
    )
      .addSelect('COALESCE(cita.fechaInicio, cita.fechaCreacion)', 'ordenFecha')
      .andWhere('cita.idPaciente = :idPaciente', { idPaciente })
      .orderBy('ordenFecha', 'DESC')
      .addOrderBy('cita.id', 'DESC')

    if (idPersonalAsignado) {
      query.andWhere('cita.idPersonal = :idPersonalAsignado', {
        idPersonalAsignado,
      })
    } else if (filtros.idPersonal) {
      query.andWhere('cita.idPersonal = :idPersonal', {
        idPersonal: filtros.idPersonal,
      })
    }

    if (filtros.fechaInicioDesde) {
      query.andWhere('cita.fechaInicio >= :fechaInicioDesde', {
        fechaInicioDesde: filtros.fechaInicioDesde,
      })
    }

    if (filtros.fechaInicioHasta) {
      query.andWhere('cita.fechaInicio <= :fechaInicioHasta', {
        fechaInicioHasta: filtros.fechaInicioHasta,
      })
    }

    if (filtros.estado) {
      query.andWhere('cita.estado = :estado', { estado: filtros.estado })
    }

    if (filtros.tipoCita) {
      query.andWhere('cita.tipoCita = :tipoCita', {
        tipoCita: filtros.tipoCita,
      })
    }

    if (filtros.idLugar) {
      query.andWhere('cita.idLugar = :idLugar', { idLugar: filtros.idLugar })
    }

    return await query.take(limite).skip(saltar).getManyAndCount()
  }

  private aplicarFiltroCursor(
    query: SelectQueryBuilder<Cita>,
    cursorFechaHora: string,
    cursorId: string
  ) {
    query.andWhere(
      '(cita.fechaInicio > :cursorFechaHora OR (cita.fechaInicio = :cursorFechaHora AND cita.id > :cursorId))',
      { cursorFechaHora, cursorId }
    )
  }

  private aplicarFiltroCursorDesc(
    query: SelectQueryBuilder<Cita>,
    cursorFechaHora: string,
    cursorId: string
  ) {
    query.andWhere(
      '(COALESCE(cita.fechaModificacion, cita.fechaCreacion) < :cursorFechaHora OR (COALESCE(cita.fechaModificacion, cita.fechaCreacion) = :cursorFechaHora AND cita.id < :cursorId))',
      { cursorFechaHora, cursorId }
    )
  }

  async contarPendientesAprobacion(params: {
    idPersonal?: string
    idLugar?: string
    fechaBase: string
  }) {
    const query = this.citaRepository()
      .createQueryBuilder('cita')
      .where('cita.estado = :estado', { estado: CitasEstado.SOLICITADA })
      .andWhere('cita.fechaInicio >= :fechaBase', {
        fechaBase: params.fechaBase,
      })

    if (params.idPersonal) {
      query.andWhere('cita.idPersonal = :idPersonal', {
        idPersonal: params.idPersonal,
      })
    }

    if (params.idLugar) {
      query.andWhere('cita.idLugar = :idLugar', { idLugar: params.idLugar })
    }

    return await query.getCount()
  }

  async listarPendientesAprobacion(params: {
    idPersonal?: string
    idLugar?: string
    fechaBase: string
    limite: number
    cursorFechaHora?: string
    cursorId?: string
  }) {
    const query = this.buildCitasQuery({
      estado: CitasEstado.SOLICITADA,
      fechaInicio: params.fechaBase,
      idPersonal: params.idPersonal,
      idLugar: params.idLugar,
    })
      .orderBy('cita.fechaInicio', 'ASC')
      .addOrderBy('cita.id', 'ASC')

    if (params.cursorFechaHora && params.cursorId) {
      this.aplicarFiltroCursor(query, params.cursorFechaHora, params.cursorId)
    }

    return await query.take(params.limite + 1).getMany()
  }

  async listarPendientesAprobacionPaginado(params: {
    idPersonal?: string
    idLugar?: string
    fechaBase: string
    limite: number
    saltar: number
  }) {
    return await this.buildCitasQuery({
      estado: CitasEstado.SOLICITADA,
      fechaInicio: params.fechaBase,
      idPersonal: params.idPersonal,
      idLugar: params.idLugar,
    })
      .orderBy('cita.fechaInicio', 'ASC')
      .addOrderBy('cita.id', 'ASC')
      .take(params.limite)
      .skip(params.saltar)
      .getManyAndCount()
  }

  async contarRechazadasSolicitadas(params: {
    idSolicitante?: string
    idLugar?: string
  }) {
    const query = this.citaRepository()
      .createQueryBuilder('cita')
      .where('cita.estado = :estado', { estado: CitasEstado.RECHAZADA })

    if (params.idSolicitante) {
      query.andWhere('cita.idUsuarioProgramo = :idSolicitante', {
        idSolicitante: params.idSolicitante,
      })
    }

    if (params.idLugar) {
      query.andWhere('cita.idLugar = :idLugar', { idLugar: params.idLugar })
    }

    return await query.getCount()
  }

  async listarRechazadasSolicitadas(params: {
    idSolicitante?: string
    idLugar?: string
    limite: number
    cursorFechaHora?: string
    cursorId?: string
  }) {
    const fechaOrdenExpr =
      'COALESCE(cita.fechaModificacion, cita.fechaCreacion)'

    const query = this.buildCitasQuery(
      {
        estado: CitasEstado.RECHAZADA,
        idLugar: params.idLugar,
      },
      params.idSolicitante
    )
      .addSelect(fechaOrdenExpr, 'fecha_orden')
      .orderBy('fecha_orden', 'DESC')
      .addOrderBy('cita.id', 'DESC')

    if (params.cursorFechaHora && params.cursorId) {
      this.aplicarFiltroCursorDesc(
        query,
        params.cursorFechaHora,
        params.cursorId
      )
    }

    return await query.take(params.limite + 1).getMany()
  }

  async listarRechazadasSolicitadasPaginado(params: {
    idSolicitante?: string
    idLugar?: string
    limite: number
    saltar: number
  }) {
    const fechaOrdenExpr =
      'COALESCE(cita.fechaModificacion, cita.fechaCreacion)'

    return await this.buildCitasQuery(
      {
        estado: CitasEstado.RECHAZADA,
        idLugar: params.idLugar,
      },
      params.idSolicitante
    )
      .addSelect(fechaOrdenExpr, 'fecha_orden')
      .orderBy('fecha_orden', 'DESC')
      .addOrderBy('cita.id', 'DESC')
      .take(params.limite)
      .skip(params.saltar)
      .getManyAndCount()
  }

  async contarBorradores(params: { idSolicitante?: string; idLugar?: string }) {
    const query = this.citaRepository()
      .createQueryBuilder('cita')
      .where('cita.estado = :estado', { estado: CitasEstado.BORRADOR })

    if (params.idSolicitante) {
      query.andWhere('cita.idUsuarioProgramo = :idSolicitante', {
        idSolicitante: params.idSolicitante,
      })
    }

    if (params.idLugar) {
      query.andWhere('cita.idLugar = :idLugar', { idLugar: params.idLugar })
    }

    return await query.getCount()
  }

  async listarBorradores(params: {
    idSolicitante?: string
    idLugar?: string
    limite: number
    cursorFechaHora?: string
    cursorId?: string
  }) {
    const fechaOrdenExpr =
      'COALESCE(cita.fechaModificacion, cita.fechaCreacion)'

    const query = this.buildCitasQuery(
      {
        estado: CitasEstado.BORRADOR,
        idLugar: params.idLugar,
      },
      params.idSolicitante
    )
      .addSelect(fechaOrdenExpr, 'fecha_orden')
      .orderBy('fecha_orden', 'DESC')
      .addOrderBy('cita.id', 'DESC')

    if (params.cursorFechaHora && params.cursorId) {
      this.aplicarFiltroCursorDesc(
        query,
        params.cursorFechaHora,
        params.cursorId
      )
    }

    return await query.take(params.limite + 1).getMany()
  }

  async listarBorradoresPaginado(params: {
    idSolicitante?: string
    idLugar?: string
    limite: number
    saltar: number
  }) {
    const fechaOrdenExpr =
      'COALESCE(cita.fechaModificacion, cita.fechaCreacion)'

    return await this.buildCitasQuery(
      {
        estado: CitasEstado.BORRADOR,
        idLugar: params.idLugar,
      },
      params.idSolicitante
    )
      .addSelect(fechaOrdenExpr, 'fecha_orden')
      .orderBy('fecha_orden', 'DESC')
      .addOrderBy('cita.id', 'DESC')
      .take(params.limite)
      .skip(params.saltar)
      .getManyAndCount()
  }

  async contarProgramadasAsignadas(params: {
    idPersonal?: string
    idLugar?: string
    fechaBase: string
  }) {
    const query = this.citaRepository()
      .createQueryBuilder('cita')
      .where('cita.estado = :estado', { estado: CitasEstado.PROGRAMADA })
      .andWhere('cita.fechaInicio >= :fechaBase', {
        fechaBase: params.fechaBase,
      })

    if (params.idPersonal) {
      query.andWhere('cita.idPersonal = :idPersonal', {
        idPersonal: params.idPersonal,
      })
    }

    if (params.idLugar) {
      query.andWhere('cita.idLugar = :idLugar', { idLugar: params.idLugar })
    }

    return await query.getCount()
  }

  async listarProgramadasAsignadas(params: {
    idPersonal?: string
    idLugar?: string
    fechaBase: string
    limite: number
    cursorFechaHora?: string
    cursorId?: string
  }) {
    const query = this.buildCitasQuery({
      estado: CitasEstado.PROGRAMADA,
      fechaInicio: params.fechaBase,
      idPersonal: params.idPersonal,
      idLugar: params.idLugar,
    })
      .orderBy('cita.fechaInicio', 'ASC')
      .addOrderBy('cita.id', 'ASC')

    if (params.cursorFechaHora && params.cursorId) {
      this.aplicarFiltroCursor(query, params.cursorFechaHora, params.cursorId)
    }

    return await query.take(params.limite + 1).getMany()
  }

  async listarProgramadasAsignadasDelDia(params: {
    idPersonal?: string
    idLugar?: string
    dia: string
  }) {
    const inicio = dayjs(params.dia).startOf('day').toISOString()
    const fin = dayjs(params.dia).endOf('day').toISOString()

    const query = this.buildCitasQuery({
      estado: CitasEstado.PROGRAMADA,
      idPersonal: params.idPersonal,
      idLugar: params.idLugar,
    })
      .andWhere('cita.fechaInicio >= :inicio', { inicio })
      .andWhere('cita.fechaInicio <= :fin', { fin })
      .orderBy('cita.fechaInicio', 'ASC')
      .addOrderBy('cita.id', 'ASC')

    return await query.getMany()
  }

  async listarProgramadasAsignadasEntreDias(params: {
    idPersonal?: string
    idLugar?: string
    diaInicio: string
    diaFin: string
    limite: number
    cursorFechaHora?: string
    cursorId?: string
  }) {
    const query = this.buildCitasQuery({
      estado: CitasEstado.PROGRAMADA,
      idPersonal: params.idPersonal,
      idLugar: params.idLugar,
    })
      .andWhere('cita.fechaInicio >= :diaInicio', {
        diaInicio: params.diaInicio,
      })
      .andWhere('cita.fechaInicio < :diaFin', { diaFin: params.diaFin })
      .orderBy('cita.fechaInicio', 'ASC')
      .addOrderBy('cita.id', 'ASC')

    if (params.cursorFechaHora && params.cursorId) {
      this.aplicarFiltroCursor(query, params.cursorFechaHora, params.cursorId)
    }

    return await query.take(params.limite + 1).getMany()
  }

  async listarProgramadasAsignadasPaginado(params: {
    idPersonal?: string
    idLugar?: string
    fechaBase: string
    dia?: string
    limite: number
    saltar: number
  }) {
    const query = this.buildCitasQuery({
      estado: CitasEstado.PROGRAMADA,
      idPersonal: params.idPersonal,
      idLugar: params.idLugar,
      fechaInicio: params.fechaBase,
    })
      .orderBy('cita.fechaInicio', 'ASC')
      .addOrderBy('cita.id', 'ASC')

    if (params.dia) {
      const inicio = dayjs(params.dia).startOf('day').toISOString()
      const fin = dayjs(params.dia).endOf('day').toISOString()
      query.andWhere('cita.fechaInicio >= :inicio', { inicio })
      query.andWhere('cita.fechaInicio <= :fin', { fin })
    }

    return await query.take(params.limite).skip(params.saltar).getManyAndCount()
  }

  async obtenerMisResumen(params: {
    idPersonal?: string
    idLugar?: string
    desde: string
    hasta?: string
  }) {
    const query = this.citaRepository()
      .createQueryBuilder('cita')
      .select(
        `SUM(CASE WHEN cita.estado = :estadoSolicitada THEN 1 ELSE 0 END)`,
        'solicitadasPendientesConfirmacion'
      )
      .addSelect(
        `SUM(CASE WHEN cita.estado = :estadoProgramada THEN 1 ELSE 0 END)`,
        'proximasProgramadas'
      )
      .addSelect(
        `SUM(CASE WHEN cita.estado IN (:...estadosOperativos) THEN 1 ELSE 0 END)`,
        'totalDesdeHoy'
      )
      .addSelect('MIN(DATE(cita.fechaInicio))', 'primeraFechaConCitas')
      .where('cita.fechaInicio >= :desde', { desde: params.desde })
      .andWhere('cita.estado IN (:...estadosOperativos)', {
        estadosOperativos: [CitasEstado.SOLICITADA, CitasEstado.PROGRAMADA],
      })
      .setParameters({
        estadoSolicitada: CitasEstado.SOLICITADA,
        estadoProgramada: CitasEstado.PROGRAMADA,
      })

    if (params.hasta) {
      query.andWhere('cita.fechaInicio <= :hasta', { hasta: params.hasta })
    }

    if (params.idPersonal) {
      query.andWhere('cita.idPersonal = :idPersonal', {
        idPersonal: params.idPersonal,
      })
    }

    if (params.idLugar) {
      query.andWhere('cita.idLugar = :idLugar', { idLugar: params.idLugar })
    }

    return await query.getRawOne<{
      solicitadasPendientesConfirmacion: string | null
      proximasProgramadas: string | null
      totalDesdeHoy: string | null
      primeraFechaConCitas: string | null
    }>()
  }

  async listarMisSolicitadas(params: {
    idPersonal?: string
    idLugar?: string
    desde: string
    hasta?: string
    limite: number
    cursorFechaHora?: string
    cursorId?: string
  }) {
    const query = this.buildCitasQuery({
      estado: CitasEstado.SOLICITADA,
      fechaInicio: params.desde,
      fechaFin: params.hasta,
      idPersonal: params.idPersonal,
      idLugar: params.idLugar,
    })
      .orderBy('cita.fechaInicio', 'ASC')
      .addOrderBy('cita.id', 'ASC')

    if (params.cursorFechaHora && params.cursorId) {
      this.aplicarFiltroCursor(query, params.cursorFechaHora, params.cursorId)
    }

    return await query.take(params.limite + 1).getMany()
  }

  async contarMisSolicitadasAprox(params: {
    idPersonal?: string
    idLugar?: string
    desde: string
    hasta?: string
  }) {
    const query = this.citaRepository()
      .createQueryBuilder('cita')
      .where('cita.estado = :estado', { estado: CitasEstado.SOLICITADA })
      .andWhere('cita.fechaInicio >= :desde', { desde: params.desde })

    if (params.hasta) {
      query.andWhere('cita.fechaInicio <= :hasta', { hasta: params.hasta })
    }

    if (params.idPersonal) {
      query.andWhere('cita.idPersonal = :idPersonal', {
        idPersonal: params.idPersonal,
      })
    }

    if (params.idLugar) {
      query.andWhere('cita.idLugar = :idLugar', { idLugar: params.idLugar })
    }

    return await query.getCount()
  }

  async listarMisTimeline(params: {
    idPersonal?: string
    idLugar?: string
    desde: string
    hasta?: string
    limite: number
    incluirSolicitadas: boolean
    cursorFechaHora?: string
    cursorId?: string
  }) {
    const estados = params.incluirSolicitadas
      ? [CitasEstado.PROGRAMADA, CitasEstado.SOLICITADA]
      : [CitasEstado.PROGRAMADA]

    const query = this.buildCitasQuery({
      fechaInicio: params.desde,
      fechaFin: params.hasta,
      idPersonal: params.idPersonal,
      idLugar: params.idLugar,
    })
      .andWhere('cita.estado IN (:...estados)', { estados })
      .orderBy('cita.fechaInicio', 'ASC')
      .addOrderBy('cita.id', 'ASC')

    if (params.cursorFechaHora && params.cursorId) {
      this.aplicarFiltroCursor(query, params.cursorFechaHora, params.cursorId)
    }

    return await query.take(params.limite + 1).getMany()
  }

  async obtenerCantidadCitasPorDia(
    filtros: FiltrosCitaDto,
    idUsuarioSolicitante?: string
  ) {
    const estadosRestringidos = [CitasEstado.BORRADOR, CitasEstado.RECHAZADA]
    const incluirRestringidasProgramadasPorSolicitante =
      Boolean(filtros.idPersonal) &&
      Boolean(idUsuarioSolicitante) &&
      filtros.idPersonal === idUsuarioSolicitante

    const query = this.citaRepository()
      .createQueryBuilder('cita')
      .select('DATE(cita.fechaInicio)', 'fecha')
      .addSelect('COUNT(cita.id)', 'cantidad')
      .where('DATE(cita.fechaInicio) >= :fechaInicio', {
        fechaInicio: filtros.fechaInicio,
      })
      .andWhere('DATE(cita.fechaInicio) <= :fechaFin', {
        fechaFin: filtros.fechaFin,
      })

    if (filtros.idPersonal) {
      if (
        incluirRestringidasProgramadasPorSolicitante &&
        (!filtros.estado || estadosRestringidos.includes(filtros.estado))
      ) {
        query.andWhere(
          '(cita.idPersonal = :idPersonal OR (cita.estado IN (:...estadosRestringidos) AND cita.idUsuarioProgramo = :idUsuarioSolicitante))',
          {
            idPersonal: filtros.idPersonal,
            estadosRestringidos,
            idUsuarioSolicitante,
          }
        )
      } else {
        query.andWhere('cita.idPersonal = :idPersonal', {
          idPersonal: filtros.idPersonal,
        })
      }
    }

    if (filtros.idLugar) {
      query.andWhere('cita.idLugar = :idLugar', {
        idLugar: filtros.idLugar,
      })
    }

    if (filtros.estado) {
      query.andWhere('cita.estado = :estado', {
        estado: filtros.estado,
      })

      if (
        idUsuarioSolicitante &&
        estadosRestringidos.includes(filtros.estado)
      ) {
        if (incluirRestringidasProgramadasPorSolicitante) {
          query.andWhere(
            '(cita.idPersonal = :idPersonal OR cita.idUsuarioProgramo = :idUsuarioSolicitante)',
            {
              idPersonal: filtros.idPersonal,
              idUsuarioSolicitante,
            }
          )
        } else {
          query.andWhere('cita.idUsuarioProgramo = :idUsuarioSolicitante', {
            idUsuarioSolicitante,
          })
        }
      }
    } else {
      query
        .andWhere('cita.estado != :estadoInactivo', {
          estadoInactivo: CitasEstado.INACTIVO,
        })
        .andWhere('cita.estado != :estadoReprogramada', {
          estadoReprogramada: CitasEstado.REPROGRAMADA,
        })
        .andWhere('cita.estado != :estadoCancelada', {
          estadoCancelada: CitasEstado.CANCELADA,
        })

      if (idUsuarioSolicitante) {
        query.andWhere(
          '(cita.estado NOT IN (:...estadosRestringidos) OR cita.idUsuarioProgramo = :idUsuarioSolicitante)',
          {
            estadosRestringidos,
            idUsuarioSolicitante,
          }
        )
      }
    }

    return await query.groupBy('DATE(cita.fechaInicio)').getRawMany<{
      fecha: string
      cantidad: string
    }>()
  }

  async obtenerCitaConRelaciones(
    id: string,
    manager?: EntityManager,
    idUsuarioSolicitante?: string,
    rolSolicitante?: string,
    incluirEstadosOcultos = false
  ) {
    return await this.buildCitasQuery(
      {},
      idUsuarioSolicitante,
      manager,
      rolSolicitante,
      incluirEstadosOcultos
    )
      .andWhere('cita.id = :id', { id })
      .getOne()
  }

  async crearCita(
    data: {
      detalle?: string
      fechaInicio: Date
      fechaFin: Date
      estado: CitasEstado
      tipoCita: TipoCita
      idPersonal?: string
      idPaciente?: string | null
      idConsultorio?: string | null
      idLugar?: string | null
      idServicio?: string | null
      idCitaNueva?: string | null
      idHistorialCita?: string | null
      idUsuarioProgramo?: string | null
      idUsuarioEnvio?: string | null
    },
    usuarioAuditoria: string,
    idEjecutor: string,
    transaccion: EntityManager,
    options?: {
      crearHistorialInicial?: boolean
    }
  ) {
    const cita = this.citaRepository(transaccion).create({
      detalle: data.detalle,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      estado: data.estado,
      tipoCita: data.tipoCita,
      usuarioCreacion: usuarioAuditoria,
      idPersonal: data.idPersonal,
      idPaciente: data.idPaciente ?? null,
      idConsultorio: data.idConsultorio ?? null,
      idLugar: data.idLugar ?? null,
      idServicio: data.idServicio ?? null,
      idCitaNueva: data.idCitaNueva ?? null,
      idHistorialCita: data.idHistorialCita ?? null,
      idUsuarioProgramo: data.idUsuarioProgramo ?? null,
      idUsuarioEnvio: data.idUsuarioEnvio ?? null,
    })

    const guardada = await this.citaRepository(transaccion).save(cita)

    if (options?.crearHistorialInicial !== false) {
      await this.historialRepository.crearHistorial(
        {
          idCita: guardada.id,
          idEjecutor,
          comentario: 'Creación de cita',
          usuarioCreacion: usuarioAuditoria,
        },
        transaccion
      )
    }

    return guardada.id
  }

  async actualizarCita(
    cita: Cita,
    data: Partial<Cita>,
    usuarioAuditoria: string,
    idEjecutor: string,
    transaccion: EntityManager
  ) {
    const detalleCambios = this.construirCambiosCita(cita, data)

    if (!detalleCambios.length) {
      return true
    }

    const patch: QueryDeepPartialEntity<Cita> = {
      usuarioModificacion: usuarioAuditoria,
    }

    if (data.detalle !== undefined) patch.detalle = data.detalle
    if (data.fechaInicio !== undefined) patch.fechaInicio = data.fechaInicio
    if (data.fechaFin !== undefined) patch.fechaFin = data.fechaFin
    if (data.idPersonal !== undefined) patch.idPersonal = data.idPersonal
    if (data.idPaciente !== undefined) patch.idPaciente = data.idPaciente
    if (data.idConsultorio !== undefined)
      patch.idConsultorio = data.idConsultorio
    if (data.idLugar !== undefined) patch.idLugar = data.idLugar

    if (data.tipoCita !== undefined) {
      patch.tipoCita = data.tipoCita
      if (data.tipoCita === TipoCita.ESTUDIO) {
        if (data.idServicio !== undefined) {
          patch.idServicio = data.idServicio
        }
      } else {
        patch.idServicio = null
      }
    }

    await this.citaRepository(transaccion).update(cita.id, {
      ...patch,
    })

    await this.historialRepository.crearHistorial(
      {
        idCita: cita.id,
        idEjecutor,
        comentario: 'Actualización de datos de cita',
        detalleCambios: detalleCambios.length ? detalleCambios : null,
        usuarioCreacion: usuarioAuditoria,
      },
      transaccion
    )

    return true
  }

  async actualizarEstadoCita(
    id: string,
    dto: ActualizarEstadoCitaDto,
    usuarioAuditoria: string,
    idEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      const estadoAnterior = cita.estado
      if (estadoAnterior === dto.estado) {
        return true
      }
      cita.estado = dto.estado
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      await this.historialRepository.crearHistorial(
        {
          idCita: cita.id,
          idEjecutor,
          comentario: 'Actualización de estado de cita',
          detalleCambios: [
            {
              field: 'estado',
              before: estadoAnterior,
              after: cita.estado,
            },
          ],
          usuarioCreacion: usuarioAuditoria,
        },
        manager
      )
      return true
    })
  }

  async reprogramarCita(
    id: string,
    dto: ReprogramarCitaDto & { fechaFin: Date },
    usuarioAuditoria: string,
    idEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      const estadoAnterior = cita.estado
      const fechaInicioAnterior = cita.fechaInicio
      const fechaFinAnterior = cita.fechaFin
      const nuevaFechaInicio = dayjs(dto.fechaInicio).toDate()
      const nuevaFechaFin = dto.fechaFin
      const nuevoEstado =
        CitasEstado.RECHAZADA === cita.estado
          ? CitasEstado.SOLICITADA
          : (cita.estado as CitasEstado)
      const detalleCambios: TipoActualizacion[] = []
      this.registrarCambio(
        detalleCambios,
        'fechaInicio',
        fechaInicioAnterior?.toISOString(),
        nuevaFechaInicio?.toISOString()
      )
      this.registrarCambio(
        detalleCambios,
        'fechaFin',
        fechaFinAnterior?.toISOString(),
        nuevaFechaFin?.toISOString()
      )
      this.registrarCambio(
        detalleCambios,
        'estado',
        estadoAnterior,
        nuevoEstado
      )
      this.registrarCambio(
        detalleCambios,
        'tipoCita',
        cita.tipoCita,
        dto.tipoCita ?? cita.tipoCita
      )
      this.registrarCambio(
        detalleCambios,
        'idServicio',
        cita.idServicio ?? undefined,
        dto.idServicio ?? cita.idServicio ?? undefined
      )

      if (!detalleCambios.length) {
        return true
      }

      cita.fechaInicio = nuevaFechaInicio
      cita.fechaFin = nuevaFechaFin
      cita.tipoCita = dto.tipoCita ?? cita.tipoCita
      cita.idServicio = dto.idServicio ?? cita.idServicio ?? null
      cita.estado = nuevoEstado
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      await this.historialRepository.crearHistorial(
        {
          idCita: cita.id,
          idEjecutor,
          comentario: 'Reprogramación de cita',
          detalleCambios,
          usuarioCreacion: usuarioAuditoria,
        },
        manager
      )
      return true
    })
  }

  async cancelarCita(
    id: string,
    dto: CancelarCitaDto,
    usuarioAuditoria: string,
    idEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cita = await this.obtenerCitaConRelaciones(id, manager)
      if (!cita) {
        return null
      }
      const estadoAnterior = cita.estado
      if (estadoAnterior === CitasEstado.CANCELADA) {
        return true
      }
      cita.estado = CitasEstado.CANCELADA
      cita.usuarioModificacion = usuarioAuditoria
      await this.citaRepository(manager).save(cita)
      await this.historialRepository.crearHistorial(
        {
          idCita: cita.id,
          idEjecutor,
          comentario: dto.comentario ?? null,
          detalleCambios: [
            {
              field: 'estado',
              before: estadoAnterior,
              after: cita.estado,
            },
          ],
          usuarioCreacion: usuarioAuditoria,
        },
        manager
      )
      return true
    })
  }

  private construirCambiosCita(cita: Cita, data: Partial<Cita>) {
    const cambios: TipoActualizacion[] = []

    this.registrarCambio(
      cambios,
      'detalle',
      cita.detalle,
      data.detalle ?? cita.detalle
    )
    this.registrarCambio(
      cambios,
      'fechaInicio',
      cita.fechaInicio?.toISOString(),
      data.fechaInicio?.toISOString()
    )
    this.registrarCambio(
      cambios,
      'fechaFin',
      cita.fechaFin?.toISOString(),
      data.fechaFin?.toISOString()
    )
    this.registrarCambio(
      cambios,
      'idPersonal',
      cita.idPersonal,
      data.idPersonal ?? cita.idPersonal
    )
    this.registrarCambio(
      cambios,
      'idPaciente',
      cita.idPaciente ?? undefined,
      data.idPaciente !== undefined
        ? (data.idPaciente ?? undefined)
        : (cita.idPaciente ?? undefined)
    )
    this.registrarCambio(
      cambios,
      'idConsultorio',
      cita.idConsultorio ?? undefined,
      data.idConsultorio !== undefined
        ? (data.idConsultorio ?? undefined)
        : (cita.idConsultorio ?? undefined)
    )
    this.registrarCambio(
      cambios,
      'idLugar',
      cita.idLugar ?? undefined,
      data.idLugar !== undefined
        ? (data.idLugar ?? undefined)
        : (cita.idLugar ?? undefined)
    )
    this.registrarCambio(
      cambios,
      'idServicio',
      cita.idServicio ?? undefined,
      data.tipoCita === TipoCita.ESTUDIO
        ? (data.idServicio ?? cita.idServicio ?? undefined)
        : data.tipoCita === TipoCita.CONSULTA
          ? undefined
          : (cita.idServicio ?? undefined)
    )
    this.registrarCambio(
      cambios,
      'tipoCita',
      cita.tipoCita,
      data.tipoCita ?? cita.tipoCita
    )

    return cambios
  }

  private registrarCambio(
    cambios: TipoActualizacion[],
    field: string,
    before?: string,
    after?: string
  ) {
    if (before !== after) {
      cambios.push({ field, before, after })
    }
  }

  async marcarCitasVencidas(
    fechaCorte: Date,
    usuarioAuditoria: string,
    idEjecutor: string
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const estadosElegibles = [CitasEstado.SOLICITADA, CitasEstado.PROGRAMADA]
      const citasVencidas = await this.citaRepository(manager).find({
        where: {
          fechaInicio: LessThan(fechaCorte),
          estado: In(estadosElegibles),
        },
      })

      if (!citasVencidas.length) {
        return 0
      }

      const citasConEstadoAnterior = citasVencidas.map((cita) => ({
        cita,
        estadoAnterior: cita.estado,
      }))

      citasConEstadoAnterior.forEach(({ cita }) => {
        cita.estado = CitasEstado.NO_ASISTIO
        cita.usuarioModificacion = usuarioAuditoria
      })

      await this.citaRepository(manager).save(
        citasConEstadoAnterior.map(({ cita }) => cita)
      )

      await this.historialRepository.crearHistoriales(
        citasConEstadoAnterior.map(({ cita, estadoAnterior }) => ({
          idCita: cita.id,
          idEjecutor,
          comentario: 'Actualización automática por cita vencida',
          detalleCambios: [
            {
              field: 'estado',
              before: estadoAnterior,
              after: cita.estado,
            },
          ],
          usuarioCreacion: usuarioAuditoria,
        })),
        manager
      )

      const notificaciones = citasConEstadoAnterior.map(({ cita }) =>
        this.notificacionRepository(manager).create({
          tipo: NotificacionTipo.CITA_NO_ASISTIO,
          mensaje: this.construirMensajeNoAsistio(cita),
          idCita: cita.id,
          idPersonal: cita.idPersonal ?? null,
          usuarioCreacion: usuarioAuditoria,
        })
      )

      await this.notificacionRepository(manager).save(notificaciones)

      return citasConEstadoAnterior.length
    })
  }

  async guardarCita(cita: Cita, manager?: EntityManager) {
    return await this.citaRepository(manager).save(cita)
  }

  async crearHistorialAccion(
    data: {
      idCita: string
      idEjecutor: string
      comentario?: string | null
      detalleCambios?: TipoActualizacion[] | null
      usuarioCreacion: string
    },
    manager?: EntityManager
  ) {
    return await this.historialRepository.crearHistorial(data, manager)
  }

  async crearNotificacionSolicitada(
    data: {
      idCita: string
      idPersonal: string
      usuarioCreacion: string
      mensaje?: string
    },
    manager?: EntityManager
  ) {
    const notificacion = this.notificacionRepository(manager).create({
      tipo: NotificacionTipo.CITA_SOLICITADA,
      mensaje:
        data.mensaje ||
        'Tienes una cita asignada pendiente de confirmación en tu agenda.',
      idCita: data.idCita,
      idPersonal: data.idPersonal,
      usuarioCreacion: data.usuarioCreacion,
    })
    return await this.notificacionRepository(manager).save(notificacion)
  }

  async crearNotificacionProgramada(
    data: {
      idCita: string
      idPersonal: string
      usuarioCreacion: string
      mensaje: string
    },
    manager?: EntityManager
  ) {
    const notificacion = this.notificacionRepository(manager).create({
      tipo: NotificacionTipo.CITA_PROGRAMADA,
      mensaje: data.mensaje,
      idCita: data.idCita,
      idPersonal: data.idPersonal,
      usuarioCreacion: data.usuarioCreacion,
    })
    return await this.notificacionRepository(manager).save(notificacion)
  }

  async crearNotificacionControlProgramado(
    data: {
      idCita: string
      idPersonal: string
      usuarioCreacion: string
      mensaje: string
    },
    manager?: EntityManager
  ) {
    const notificacion = this.notificacionRepository(manager).create({
      tipo: NotificacionTipo.CITA_CONTROL_PROGRAMADO,
      mensaje: data.mensaje,
      idCita: data.idCita,
      idPersonal: data.idPersonal,
      usuarioCreacion: data.usuarioCreacion,
    })
    return await this.notificacionRepository(manager).save(notificacion)
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }

  async obtenerServicioPorId(idServicio: string, manager?: EntityManager) {
    const entityManager = manager ?? this.dataSource.manager
    return await entityManager
      .getRepository(Servicio)
      .createQueryBuilder('servicio')
      .leftJoinAndSelect('servicio.servicioCategorias', 'servicioCategorias')
      .leftJoinAndSelect('servicioCategorias.categoria', 'categoria')
      .where('servicio.id = :idServicio', { idServicio })
      .getOne()
  }
}
