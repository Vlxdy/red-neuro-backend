import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UsuariosRegistradosService } from '@/application/usuarios-registrado/service/usuarios-registrados.service'
import { SeguimientoRepository } from '../repository/seguimiento.repository'
import { CrearSeguimientoDto } from '../dto/seguimiento.dto'

@Injectable()
export class SeguimientoService extends BaseService {
  constructor(
    @Inject(SeguimientoRepository)
    private seguimientoRepositorio: SeguimientoRepository,
    private usuariosRegistradosService: UsuariosRegistradosService
  ) {
    super()
  }

  async crearSeguimiento(
    data: CrearSeguimientoDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<{ id: string }> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearSeguimiento(
          data,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }

      return await this.seguimientoRepositorio.runTransaction(op)
    }

    const medico = await this.usuariosRegistradosService.obtenerMedico(
      data.idMedico,
      transaccion
    )
    const paciente = await this.usuariosRegistradosService.obtenerPaciente(
      data.idPaciente,
      transaccion
    )

    const seguimiento = await this.seguimientoRepositorio.crear({
      idMedico: medico.id,
      idPaciente: paciente.id,
      usuarioAuditoria,
    })
    return { id: seguimiento.id }
  }
}
