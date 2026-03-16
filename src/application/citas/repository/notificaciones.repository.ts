import { Injectable } from '@nestjs/common'
import dayjs from 'dayjs'
import { DataSource } from 'typeorm'
import { Notificacion, NotificacionTipo } from '../entities/notificacion.entity'
import { Cita } from '../entities/cita.entity'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { CitasEstado } from '../constants'
import { FiltroNotificacionDto } from '../dto/notificacion.dto'
import { RolEnumId } from '@/core/authorization/rol.enum'

@Injectable()
export class NotificacionesRepository {
  constructor(private readonly dataSource: DataSource) {}

  private notificacionRepo() {
    return this.dataSource.getRepository(Notificacion)
  }

  private citaRepo() {
    return this.dataSource.getRepository(Cita)
  }

  private usuarioRolRepo() {
    return this.dataSource.getRepository(UsuarioRol)
  }

  async listar(
    filtros: FiltroNotificacionDto,
    idUsuarioRol: string,
    idRol: string
  ): Promise<[Notificacion[], number]> {
    const qb = this.notificacionRepo().createQueryBuilder('n')

    qb.where('n.estado = :estado', { estado: 'ACTIVO' })

    if (idRol === RolEnumId.PERSONAL_SALUD) {
      qb.andWhere('n.idPersonal = :idUsuarioRol', { idUsuarioRol })
    }

    if (filtros.noLeidas) {
      qb.andWhere('n.visto = false')
    }

    if (filtros.tipo) {
      qb.andWhere('n.tipo = :tipo', { tipo: filtros.tipo })
    }

    qb.orderBy('n.fechaCreacion', 'DESC')
      .skip(filtros.saltar)
      .take(filtros.limite)

    return await qb.getManyAndCount()
  }

  async obtenerPorId(
    id: string,
    idRol: string,
    idUsuarioRol: string
  ): Promise<Notificacion | null> {
    const where =
      idRol === RolEnumId.PERSONAL_SALUD
        ? { id, idPersonal: idUsuarioRol }
        : { id }

    return await this.notificacionRepo().findOne({ where })
  }

  async obtenerPendientes(
    idRol: string,
    idUsuarioRol: string
  ): Promise<Notificacion[]> {
    const where =
      idRol === RolEnumId.PERSONAL_SALUD
        ? { idPersonal: idUsuarioRol, visto: false }
        : { visto: false }

    return await this.notificacionRepo().find({ where })
  }

  async guardarNotificaciones(notificaciones: Notificacion[]) {
    return await this.notificacionRepo().save(notificaciones)
  }

  async guardarNotificacion(notificacion: Notificacion) {
    return await this.notificacionRepo().save(notificacion)
  }

  async contarProgramadasAsignadas(
    idUsuarioRol: string,
    fecha: string
  ): Promise<number> {
    const inicio = dayjs(fecha).startOf('day').toDate()
    const fin = dayjs(fecha).endOf('day').toDate()

    return await this.citaRepo()
      .createQueryBuilder('c')
      .where('c.idPersonal = :idUsuarioRol', { idUsuarioRol })
      .andWhere('c.estado = :estado', { estado: CitasEstado.PROGRAMADA })
      .andWhere('c.fecha_inicio between :inicio and :fin', { inicio, fin })
      .getCount()
  }

  async contarProgramadasAdmin(
    fecha: string
  ): Promise<{ citasConPersonal: number; citasSinPersonal: number }> {
    const inicio = dayjs(fecha).startOf('day').toDate()
    const fin = dayjs(fecha).endOf('day').toDate()

    const [citasConPersonal, citasSinPersonal] = await Promise.all([
      this.citaRepo()
        .createQueryBuilder('c')
        .where('c.fecha_inicio between :inicio and :fin', { inicio, fin })
        .andWhere('c.estado = :estado', { estado: CitasEstado.PROGRAMADA })
        .andWhere('c.idPersonal is not null')
        .getCount(),
      this.citaRepo()
        .createQueryBuilder('c')
        .where('c.fecha_inicio between :inicio and :fin', { inicio, fin })
        .andWhere('c.estado = :estado', { estado: CitasEstado.PROGRAMADA })
        .andWhere('c.idPersonal is null')
        .getCount(),
    ])

    return { citasConPersonal, citasSinPersonal }
  }

  async obtenerConteoPorPersonal(fecha: string) {
    const inicio = dayjs(fecha).startOf('day').toDate()
    const fin = dayjs(fecha).endOf('day').toDate()

    return await this.citaRepo()
      .createQueryBuilder('c')
      .select('c.idPersonal', 'idPersonal')
      .addSelect('count(*)', 'cantidad')
      .where('c.fecha_inicio between :inicio and :fin', { inicio, fin })
      .andWhere('c.estado = :estado', { estado: CitasEstado.PROGRAMADA })
      .andWhere('c.idPersonal is not null')
      .groupBy('c.idPersonal')
      .getRawMany<{ idPersonal: string; cantidad: string }>()
  }

  async obtenerNombreCompletoUsuarioRol(
    idUsuarioRol: string
  ): Promise<string | null> {
    const registro = await this.usuarioRolRepo()
      .createQueryBuilder('ur')
      .leftJoin('ur.usuario', 'u')
      .leftJoin('u.persona', 'p')
      .select('p.nombres', 'nombres')
      .addSelect('p.primerApellido', 'primerApellido')
      .addSelect('p.segundoApellido', 'segundoApellido')
      .where('ur.id = :idUsuarioRol', { idUsuarioRol })
      .andWhere('ur.estado = :estado', { estado: 'ACTIVO' })
      .getRawOne<{
        nombres?: string | null
        primerApellido?: string | null
        segundoApellido?: string | null
      }>()

    if (!registro) {
      return null
    }

    const nombreCompleto = [
      registro.nombres,
      registro.primerApellido,
      registro.segundoApellido,
    ]
      .filter((valor): valor is string => Boolean(valor?.trim()))
      .join(' ')
      .trim()

    return nombreCompleto || null
  }

  async obtenerAdministradoresActivos() {
    return await this.usuarioRolRepo().find({
      where: { idRol: RolEnumId.ADMINISTRADOR, estado: 'ACTIVO' as never },
    })
  }

  crearNotificacionResumenPersonal(idPersonal: string, cantidad: number) {
    return this.notificacionRepo().create({
      tipo: NotificacionTipo.CITA_PROGRAMADA,
      mensaje: `Resumen diario: tienes ${cantidad} citas programadas para hoy.`,
      idPersonal,
      usuarioCreacion: '0',
    })
  }

  crearNotificacionResumenAdmin(
    idPersonal: string,
    citasConPersonal: number,
    citasSinPersonal: number
  ) {
    return this.notificacionRepo().create({
      tipo: NotificacionTipo.CITA_PROGRAMADA,
      mensaje: `Resumen diario: con personal ${citasConPersonal}, sin personal ${citasSinPersonal}.`,
      idPersonal,
      usuarioCreacion: '0',
    })
  }
}
