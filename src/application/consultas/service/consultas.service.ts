import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { ConsultasRepository } from '../repository/consultas.repository'
import { CrearConsultaDto } from '../dto/asignaciones.dto'
import { UsuariosRegistradosService } from '@/application/usuarios-registrado/service/usuarios-registrados.service'

@Injectable()
export class ConsultasService extends BaseService {
  constructor(
    @Inject(ConsultasRepository)
    private consultasRepositorio: ConsultasRepository,
    private usuariosRegistradosService: UsuariosRegistradosService
  ) {
    super()
  }

  async crearConsulta(
    data: CrearConsultaDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<{ id: string }> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearConsulta(
          data,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }

      return await this.consultasRepositorio.runTransaction(op)
    }

    const medico = await this.usuariosRegistradosService.obtenerMedico(
      data.idMedico,
      transaccion
    )
    const paciente = await this.usuariosRegistradosService.obtenerPaciente(
      data.idPaciente,
      transaccion
    )

    const asignacion = await this.consultasRepositorio.crear({
      idMedico: medico.id,
      idPaciente: paciente.id,
      usuarioAuditoria,
    })
    return { id: asignacion.id }
  }
}
