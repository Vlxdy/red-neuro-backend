import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { TextService } from '../../../common/lib/text.service'
import { Rol } from '../../authorization/entity/rol.entity'
import { UsuarioRol } from '../../authorization/entity/usuario-rol.entity'
import { Persona } from '../entity/persona.entity'
import { CrearUsuarioDto } from '../dto/crear-usuario.dto'
import { Usuario } from '../entity/usuario.entity'
import { PersonaDto } from '../dto/persona.dto'
import { Status } from '../../../common/constants'
import { FiltrosUsuarioDto } from '../dto/filtros-usuario.dto'
import { Injectable } from '@nestjs/common'
import { Brackets, DataSource, EntityManager } from 'typeorm'
import { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto'
import dayjs from 'dayjs'

@Injectable()
export class UsuarioRepository {
  constructor(private dataSource: DataSource) {}

  async listar(paginacionQueryDto: FiltrosUsuarioDto) {
    const { limite, saltar, filtro, rol, orden, sentido } = paginacionQueryDto

    const query = this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.usuarioRol', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.rol', 'rol')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .select([
        'usuario.id',
        'usuario.usuario',
        'usuario.correoElectronico',
        'usuario.estado',
        'usuario.ciudadaniaDigital',
        'usuarioRol',
        'rol.id',
        'rol.rol',
        'persona.nroDocumento',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'persona.fechaNacimiento',
        'persona.tipoDocumento',
      ])
      .where('usuarioRol.estado = :estado', { estado: Status.ACTIVE })
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nroDocumento':
        query.addOrderBy('persona.nroDocumento', sentido)
        break
      case 'nombres':
        query.addOrderBy('persona.nombres', sentido)
        break
      case 'usuario':
        query.addOrderBy('usuario.usuario', sentido)
        break
      case 'rol':
        query.addOrderBy('rol.rol', sentido)
        break
      case 'estado':
        query.addOrderBy('usuario.estado', sentido)
        break
      default:
        query.addOrderBy('usuario.id', 'ASC')
    }

    if (rol) {
      query.andWhere('rol.id IN(:...roles)', {
        roles: rol,
      })
    }
    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('usuario.usuario ilike :filtro', { filtro: `%${filtro}%` })
          qb.orWhere('persona.nroDocumento ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('persona.nombres ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('persona.primerApellido ilike :filtro', {
            filtro: `%${filtro}%`,
          })
          qb.orWhere('persona.segundoApellido ilike :filtro', {
            filtro: `%${filtro}%`,
          })
        })
      )
    }
    return await query.getManyAndCount()
  }

  async recuperar() {
    return await this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.usuarioRol', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.rol', 'rol')
      .getMany()
  }

  async buscarUsuario(usuario: string) {
    return await this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.usuarioRol', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.rol', 'rol')
      .where({ usuario: usuario })
      .getOne()
  }

  async buscarPorId(id: string, transaction?: EntityManager) {
    return await (
      transaction?.getRepository(Usuario) ??
      this.dataSource.getRepository(Usuario)
    )
      .createQueryBuilder('usuario')
      .where({ id: id })
      .getOne()
  }

  async buscarUsuarioRolPorId(id: string) {
    return await this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.usuarioRol', 'usuarioRol')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuarioRol.rol', 'rol')
      .select([
        'usuario.id',
        'usuario.usuario',
        'usuario.contrasena',
        'usuario.estado',
        'usuario.ciudadaniaDigital',
        'persona.nombres',
        'persona.primerApellido',
        'persona.segundoApellido',
        'persona.tipoDocumento',
        'persona.nroDocumento',
        'persona.fechaNacimiento',
        'usuarioRol',
        'rol',
      ])
      .where({ id })
      .getOne()
  }

  async buscarUsuarioPorCI(persona: PersonaDto) {
    return await this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.persona', 'persona')
      .leftJoinAndSelect('usuario.usuarioRol', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.rol', 'rol')
      .where('persona.nroDocumento = :ci', { ci: persona.nroDocumento })
      .getOne()
  }

  async verificarExisteUsuarioPorCI(ci: string) {
    return await this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .leftJoin('usuario.persona', 'persona')
      .select('usuario.id')
      .where('persona.nroDocumento = :ci', { ci: ci })
      .getOne()
  }

  async buscarUsuarioPorCorreo(correo: string) {
    return await this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .where('usuario.correoElectronico = :correo', { correo })
      .getOne()
  }

  async crear(
    usuarioDto: CrearUsuarioDto,
    usuarioAuditoria: string,
    transaction: EntityManager
  ) {
    const personaResult = await transaction.getRepository(Persona).save(
      new Persona({
        nombres: usuarioDto?.persona?.nombres,
        primerApellido: usuarioDto?.persona?.primerApellido,
        segundoApellido: usuarioDto?.persona?.segundoApellido,
        nroDocumento: usuarioDto?.persona?.nroDocumento,
        fechaNacimiento: usuarioDto?.persona?.fechaNacimiento,
        tipoDocumento: usuarioDto.persona.tipoDocumento,
        usuarioCreacion: usuarioAuditoria,
      })
    )

    const usuarioResult = await transaction.getRepository(Usuario).save(
      new Usuario({
        idPersona: personaResult.id,
        usuarioRol: [],
        usuario: usuarioDto.usuario || usuarioDto?.persona?.nroDocumento, // TODO revisar usuario
        estado: usuarioDto?.estado ?? Status.CREATE,
        correoElectronico: usuarioDto?.correoElectronico,
        contrasena:
          usuarioDto?.contrasena ??
          (await TextService.encrypt(TextService.generateUuid())),
        ciudadaniaDigital: usuarioDto?.ciudadaniaDigital ?? false,
        usuarioCreacion: usuarioAuditoria,
      })
    )

    const usuarioRoles: QueryDeepPartialEntity<UsuarioRol>[] =
      usuarioDto.roles.map((idRol) => {
        // Rol
        const rol = new Rol()
        rol.id = idRol

        // UsuarioRol
        const usuarioRol = new UsuarioRol()
        usuarioRol.rol = rol
        usuarioRol.usuarioCreacion = usuarioAuditoria
        usuarioRol.idUsuario = usuarioResult.id

        return usuarioRol
      })

    await transaction
      .createQueryBuilder()
      .insert()
      .into(UsuarioRol)
      .values(usuarioRoles)
      .execute()

    return usuarioResult
  }

  async actualizar(
    idUsuario: string,
    usuarioDto: Partial<ActualizarUsuarioDto>,
    usuarioAuditoria: string,
    transaction?: EntityManager
  ) {
    const repo = transaction
      ? transaction.getRepository(Usuario)
      : this.dataSource.getRepository(Usuario)

    const datosActualizar: QueryDeepPartialEntity<Usuario> = new Usuario({
      estado: usuarioDto.estado || undefined,
      correoElectronico: usuarioDto.correoElectronico || undefined,
      contrasena: usuarioDto.contrasena || undefined,
      intentos: usuarioDto.intentos || undefined,
      fechaBloqueo: usuarioDto.fechaBloqueo
        ? dayjs(usuarioDto.fechaBloqueo).toDate()
        : undefined,
      codigoDesbloqueo: usuarioDto.codigoDesbloqueo,
      usuarioModificacion: usuarioAuditoria,
    })
    return await repo.update(idUsuario, datosActualizar)
  }

  async crearConPersonaExistente(usuarioDto, usuarioAuditoria: string) {
    const usuarioRoles: UsuarioRol[] = usuarioDto.roles.map((rol) => {
      const usuarioRol = new UsuarioRol()
      usuarioRol.rol = rol
      usuarioRol.usuarioCreacion = usuarioAuditoria

      return usuarioRol
    })

    // Usuario
    const usuario = new Usuario()
    usuario.usuarioRol = usuarioRoles

    // Persona
    usuario.persona = usuarioDto.persona

    usuario.usuario = usuarioDto?.persona?.nroDocumento ?? usuarioDto.usuario
    usuario.estado = usuarioDto?.estado ?? Status.CREATE
    usuario.correoElectronico = usuarioDto?.correoElectronico
    usuario.contrasena =
      usuarioDto?.contrasena ??
      (await TextService.encrypt(TextService.generateUuid()))
    usuario.ciudadaniaDigital = usuarioDto?.ciudadaniaDigital ?? false
    usuario.usuarioCreacion = usuarioAuditoria

    return await this.dataSource.getRepository(Usuario).save(usuario)
  }

  async actualizarContadorBloqueos(idUsuario: string, intento: number) {
    return await this.dataSource
      .createQueryBuilder()
      .update(Usuario)
      .set({
        intentos: intento,
      })
      .where({ id: idUsuario })
      .execute()
  }

  async actualizarDatosBloqueo(
    idUsuario: string,
    codigo: string,
    fechaBloqueo: Date
  ) {
    const datosActualizar: QueryDeepPartialEntity<Usuario> = new Usuario({
      codigoDesbloqueo: codigo,
      fechaBloqueo: fechaBloqueo,
    })
    return await this.dataSource
      .createQueryBuilder()
      .update(Usuario)
      .set(datosActualizar)
      .where({ id: idUsuario })
      .execute()
  }

  async actualizarDatosRecuperacion(idUsuario: string, codigo: string) {
    const datosActualizar: QueryDeepPartialEntity<Usuario> = new Usuario({
      codigoRecuperacion: codigo,
    })
    return await this.dataSource
      .createQueryBuilder()
      .update(Usuario)
      .set(datosActualizar)
      .where({ id: idUsuario })
      .execute()
  }

  async actualizarDatosActivacion(
    idUsuario: string,
    codigo: string,
    usuarioAuditoria: string,
    transaction: EntityManager
  ) {
    const datosActualizar: QueryDeepPartialEntity<Usuario> = new Usuario({
      codigoActivacion: codigo,
      usuarioModificacion: usuarioAuditoria,
    })
    return await transaction
      .createQueryBuilder()
      .update(Usuario)
      .set(datosActualizar)
      .where({ id: idUsuario })
      .execute()
  }

  async actualizarDatosTransaccion(idUsuario: string, codigo: string) {
    return await this.dataSource
      .createQueryBuilder()
      .update(Usuario)
      .set({
        codigoTransaccion: codigo,
      })
      .where({ id: idUsuario })
      .execute()
  }

  async buscarPorCodigoDesbloqueo(codigo: string) {
    return await this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .select(['usuario.id', 'usuario.estado', 'usuario.fechaBloqueo'])
      .where('usuario.codigoDesbloqueo = :codigo', { codigo })
      .getOne()
  }

  async buscarPorCodigoRecuperacion(codigo: string) {
    return await this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .select(['usuario.id', 'usuario.estado', 'usuario.fechaBloqueo'])
      .where('usuario.codigoRecuperacion = :codigo', { codigo })
      .getOne()
  }

  async buscarPorCodigoTransaccion(codigo: string) {
    return await this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .select(['usuario.id', 'usuario.estado', 'usuario.fechaBloqueo'])
      .where('usuario.codigoTransaccion = :codigo', { codigo })
      .getOne()
  }

  async buscarPorCodigoActivacion(codigo: string) {
    return await this.dataSource
      .getRepository(Usuario)
      .createQueryBuilder('usuario')
      .select(['usuario.id', 'usuario.estado', 'usuario.fechaBloqueo'])
      .where('usuario.codigoActivacion = :codigo', { codigo })
      .getOne()
  }

  async actualizarDatosPersona(persona: PersonaDto) {
    const datosActualizar: QueryDeepPartialEntity<Persona> = new Persona({
      ...persona,
    })
    return await this.dataSource
      .createQueryBuilder()
      .update(Persona)
      .set(datosActualizar)
      .where('nroDocumento = :nroDocumento', {
        nroDocumento: persona.nroDocumento,
      })
      .execute()
  }

  async actualizarUsuario(
    id: string,
    usuario: Partial<Usuario>,
    usuarioAuditoria: string,
    transaction?: EntityManager
  ) {
    const repo = transaction
      ? transaction.getRepository(Usuario)
      : this.dataSource.getRepository(Usuario)

    const datosActualizar: QueryDeepPartialEntity<Usuario> = new Usuario({
      ...usuario,
      usuarioModificacion: usuarioAuditoria,
    })
    return await repo
      .createQueryBuilder()
      .update(Usuario)
      .set(datosActualizar)
      .where({ id: id })
      .execute()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return this.dataSource.manager.transaction<T>(op)
  }
}
