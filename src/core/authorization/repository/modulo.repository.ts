import { Brackets, DataSource } from 'typeorm'
import { Modulo, Propiedades } from '../entity/modulo.entity'
import { CrearModuloDto, FiltroModuloDto } from '../dto/crear-modulo.dto'
import { Injectable } from '@nestjs/common'
import { Status } from '../../../common/constants'
import { ActualizarModuloDto } from '../dto/actualizar-modulo.dto'

@Injectable()
export class ModuloRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(Modulo)
      .createQueryBuilder('modulo')
      .where({ id: id })
      .getOne()
  }

  async listar(paginacionQueryDto: FiltroModuloDto) {
    const { limite, saltar, filtro, seccion, orden, sentido } =
      paginacionQueryDto
    const query = this.dataSource
      .getRepository(Modulo)
      .createQueryBuilder('modulo')
      .leftJoin('modulo.modulo', 'moduloTipoSeccion')
      .select([
        'modulo.id',
        'modulo.label',
        'modulo.url',
        'modulo.nombre',
        'modulo.propiedades',
        'modulo.estado',
        'moduloTipoSeccion.id',
      ])
      .take(limite)
      .skip(saltar)

    switch (orden) {
      case 'nombre':
        query.addOrderBy('modulo.nombre', sentido)
        break
      case 'label':
        query.addOrderBy('modulo.label', sentido)
        break
      case 'url':
        query.addOrderBy('modulo.url', sentido)
        break
      case 'estado':
        query.addOrderBy('modulo.estado', sentido)
        break
      default:
        query.addOrderBy('modulo.id', 'ASC')
    }

    if (filtro) {
      query.andWhere(
        new Brackets((qb) => {
          qb.orWhere('modulo.label ilike :filtro', { filtro: `%${filtro}%` })
          qb.orWhere('modulo.nombre ilike :filtro', { filtro: `%${filtro}%` })
        })
      )
    }
    if (seccion) {
      query.andWhere('(modulo.modulo is null)')
    }
    return await query.getManyAndCount()
  }

  async obtenerModulosSubmodulos() {
    return await this.dataSource
      .getRepository(Modulo)
      .createQueryBuilder('modulo')
      .leftJoinAndSelect(
        'modulo.subModulo',
        'subModulo',
        'subModulo.estado = :estado',
        {
          estado: Status.ACTIVE,
        }
      )
      .select([
        'modulo.id',
        'modulo.label',
        'modulo.url',
        'modulo.nombre',
        'modulo.propiedades',
        'modulo.estado',
        'subModulo.id',
        'subModulo.label',
        'subModulo.url',
        'subModulo.nombre',
        'subModulo.propiedades',
        'subModulo.estado',
      ])
      .where('modulo.id_modulo is NULL')
      .andWhere('modulo.estado = :estado', {
        estado: Status.ACTIVE,
      })
      .orderBy(`"modulo"."propiedades"->'orden'`, 'ASC')
      .addOrderBy(`"subModulo"."propiedades"->'orden'`, 'ASC')
      .getMany()
  }

  async crear(moduloDto: CrearModuloDto, usuarioAuditoria: string) {
    const propiedades: Propiedades = {
      icono: moduloDto.propiedades.icono,
      descripcion: moduloDto.propiedades.descripcion,
      orden: moduloDto.propiedades.orden,
    }

    const modulo = new Modulo()
    modulo.label = moduloDto.label
    modulo.url = moduloDto.url
    modulo.nombre = moduloDto.nombre
    modulo.propiedades = propiedades
    modulo.usuarioCreacion = usuarioAuditoria

    if (moduloDto.idModulo) {
      const em = new Modulo()
      em.id = moduloDto.idModulo
      modulo.modulo = em
    }

    return await this.dataSource.getRepository(Modulo).save(modulo)
  }

  async actualizar(
    id: string,
    moduloDto: ActualizarModuloDto,
    usuarioAuditoria: string
  ) {
    const datosActualizar = new Modulo({
      ...moduloDto,
      usuarioModificacion: usuarioAuditoria,
    })

    return await this.dataSource
      .getRepository(Modulo)
      .update(id, datosActualizar)
  }

  async eliminar(id: string) {
    return await this.dataSource.getRepository(Modulo).delete(id)
  }
}
