import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UsuariosRegistradosService } from '@/application/usuarios-registrado/service/usuarios-registrados.service'
import { ControlRepository } from '../repository/control.repository'
import { CrearControlDto } from '../dto/control.dto'

@Injectable()
export class ControlService extends BaseService {
  constructor(
    @Inject(ControlRepository)
    private controlRepositorio: ControlRepository,
    private usuariosRegistradosService: UsuariosRegistradosService
  ) {
    super()
  }

  async crearControl(
    data: CrearControlDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<{ id: string }> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearControl(data, usuarioAuditoria, nuevaTransaccion)
      }

      return await this.controlRepositorio.runTransaction(op)
    }

    const medico = await this.usuariosRegistradosService.obtenerMedico(
      data.idMedico,
      transaccion
    )
    const paciente = await this.usuariosRegistradosService.obtenerPaciente(
      data.idPaciente,
      transaccion
    )

    const seguimiento = await this.controlRepositorio.crear({
      idMedico: medico.id,
      idPaciente: paciente.id,
      usuarioAuditoria,
    })
    return { id: seguimiento.id }
  }
}
