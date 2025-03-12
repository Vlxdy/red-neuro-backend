import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable } from '@nestjs/common'
import { AsignacionesRepository } from '../repository/asignaciones.repository'
import { CrearAsignacionDto } from '../dto/asignaciones.dto'
import { EntityManager } from 'typeorm'
import { MedicoPacienteService } from './medico.paciente.service'

@Injectable()
export class AsignacionesService extends BaseService {
  constructor(
    @Inject(AsignacionesRepository)
    private asignacionRepositorio: AsignacionesRepository,
    private medicoPacienteService: MedicoPacienteService
  ) {
    super()
  }

  async asignarMedicoPaciente(
    data: CrearAsignacionDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<{ id: string }> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.asignarMedicoPaciente(
          data,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }

      return await this.asignacionRepositorio.runTransaction(op)
    }

    const medico = await this.medicoPacienteService.obtenerMedico(
      data.idMedico,
      transaccion
    )
    const paciente = await this.medicoPacienteService.obtenerPaciente(
      data.idPaciente,
      transaccion
    )

    const asignacion = await this.asignacionRepositorio.crear({
      idMedico: medico.id,
      idPaciente: paciente.id,
      usuarioAuditoria,
    })
    return { id: asignacion.id }
  }
}
