import { DataSource, EntityManager } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { CreateEvaluacionAntropometricaDto } from '../dtos/evaluacion.dto'
import { EvaluacionNutricional } from '../entities/evaluacion-nutricional.entity'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'

@Injectable()
export class EvaluacionNutricionalRepository {
  constructor(private dataSource: DataSource) {}

  async buscarPorId(id: string) {
    return await this.dataSource
      .getRepository(EvaluacionNutricional)
      .createQueryBuilder('evaluacion')
      .where({ id })
      .getOne()
  }

  async actualizar({
    id,
    datosDto,
    usuarioAuditoria,
  }: {
    id: string
    datosDto: Partial<EvaluacionNutricional>
    usuarioAuditoria: string
  }) {
    const datosActualizar = new EvaluacionNutricional({
      ...datosDto,
      usuarioModificacion: usuarioAuditoria,
    })
    return await this.dataSource
      .getRepository(EvaluacionNutricional)
      .update(id, datosActualizar)
  }

  async crear({
    idHistoriaClinica,
    data,
    usuarioAuditoria,
    transaccion,
  }: {
    idHistoriaClinica: string
    data: CreateEvaluacionAntropometricaDto
    usuarioAuditoria: string
    transaccion: EntityManager
  }) {
    const { diagnostico } = data
    const consultas = new EvaluacionNutricional({
      idHistoriaClinica,
      diagnostico,
      requerimientoCalorico: data.requerimientoCalorico,
      usuarioCreacion: usuarioAuditoria,
      ...data,
    })
    return await transaccion
      .getRepository(EvaluacionNutricional)
      .save(consultas)
  }
  async buscarPorHistoriaClinica(
    idHistoriaClinica: string,
    paginacion: PaginacionQueryDto
  ): Promise<[EvaluacionNutricional[], number]> {
    const { limite, saltar, filtro } = paginacion
    const query = this.dataSource
      .getRepository(EvaluacionNutricional)
      .createQueryBuilder('evaluacion')
      .leftJoinAndSelect('evaluacion.archivos', 'archivos')
      .select(['evaluacion', 'archivos'])
      .where({ idHistoriaClinica })
      .orderBy('evaluacion.id', 'DESC')
      .take(limite)
      .skip(saltar)

    if (filtro && filtro.trim() !== '') {
      query.andWhere('evaluacion.diagnostico ILIKE :filtro', {
        filtro: `%${filtro}%`,
      })
    }

    return await query.getManyAndCount()
  }

  async runTransaction<T>(op: (entityManager: EntityManager) => Promise<T>) {
    return await this.dataSource.manager.transaction<T>(op)
  }
}
