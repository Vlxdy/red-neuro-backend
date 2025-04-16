import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UsuariosRegistradosService } from '@/application/usuarios-registrado/service/usuarios-registrados.service'
import { CitasRepository } from '../repository/citas.repository'
import { CrearCitaDto } from '../dto/citas.dto'

@Injectable()
export class CitasService extends BaseService {
  constructor(
    @Inject(CitasRepository)
    private citasRepositorio: CitasRepository,
    private usuariosRegistradosService: UsuariosRegistradosService
  ) {
    super()
  }

  async crearCita(
    idMedico: string,
    data: CrearCitaDto,
    usuarioAuditoria: string,
    transaccion?: EntityManager
  ): Promise<{ id: string }> {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearCita(
          idMedico,
          data,
          usuarioAuditoria,
          nuevaTransaccion
        )
      }

      return await this.citasRepositorio.runTransaction(op)
    }

    await this.usuariosRegistradosService.obtenerMedico(idMedico, transaccion)
    await this.usuariosRegistradosService.obtenerPaciente(
      data.idPaciente,
      transaccion
    )

    const asignacion = await this.citasRepositorio.crear({
      idMedico,
      data,
      usuarioAuditoria,
      transaccion,
    })
    return { id: asignacion.id }
  }

  async buscarPorId(id: string, transaccion?: EntityManager) {
    const cita = await this.citasRepositorio.buscarPorId(id, transaccion)
    if (!cita) {
      throw new NotFoundException('Cita no encontrada')
    }
    return cita
  }
}
