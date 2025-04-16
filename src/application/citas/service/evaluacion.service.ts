import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UsuariosRegistradosService } from '@/application/usuarios-registrado/service/usuarios-registrados.service'
import { EvaluacionRepository } from '../repository/evaluacion.repository'
import { CrearEvaluacionDto } from '../dto/evaluacion.dto'
import { CitasService } from '@/application/citas/service/citas.service'

@Injectable()
export class EvaluacionService extends BaseService {
  constructor(
    @Inject(EvaluacionRepository)
    private evaluacionRepositorio: EvaluacionRepository,
    private usuariosRegistradosService: UsuariosRegistradosService,
    private citasService: CitasService
  ) {
    super()
  }

  async crearEvaluacion(
    idCita: string,
    data: CrearEvaluacionDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<{ id: string }> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearEvaluacion(
          idCita,
          data,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }

      return await this.evaluacionRepositorio.runTransaction(op)
    }

    await this.citasService.buscarPorId(idCita)

    const evaluacion = await this.evaluacionRepositorio.crear({
      idCita,
      data,
      usuarioAuditoria,
      transaccion,
    })
    return { id: evaluacion.id }
  }
}
