import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { PacientesService } from '@/application/gestion-pacientes/services/pacientes.service'
import { AsignacionRepository } from '../repositories/asignacion.repository'
import { AsignacionEstado } from '../constant'
import { MedicosService } from './medicos.service'
import { HistoriaClinicaService } from '@/application/historia-clinica/services/historia-clinico.service'

@Injectable()
export class AsignacionService extends BaseService {
  constructor(
    @Inject(AsignacionRepository)
    private asignacionRepositorio: AsignacionRepository,
    private medicosService: MedicosService,
    private pacientesService: PacientesService,
    private historiaClinicaService: HistoriaClinicaService
  ) {
    super()
  }

  // async crearControl(
  //   data: CrearControlDto,
  //   usuarioAuditoria: string,
  //   transaccion?: EntityManager
  // ): Promise<{ id: string }> {
  //   if (!transaccion) {
  //     const op = async (nuevaTransaccion: EntityManager) => {
  //       return await this.crearControl(data, usuarioAuditoria, nuevaTransaccion)
  //     }

  //     return await this.controlRepositorio.runTransaction(op)
  //   }

  //   const medico = await this.usuariosRegistradosService.obtenerMedico(
  //     data.idMedico,
  //     transaccion
  //   )
  //   const paciente = await this.usuariosRegistradosService.obtenerPaciente(
  //     data.idPaciente,
  //     transaccion
  //   )

  //   const control = await this.controlRepositorio.buscarPorPaciente(
  //     data.idPaciente,
  //     transaccion
  //   )
  //   if (control) {
  //     if (control.idMedico !== data.idMedico) {
  //       await this.controlRepositorio.actualizar({
  //         id: control.id,
  //         datosDto: { estado: ControlEstado.INACTIVO },
  //         usuarioAuditoria,
  //       })
  //     } else {
  //       return { id: control.id }
  //     }
  //   }
  //   const controlSave = await this.controlRepositorio.crear({
  //     idMedico: medico.id,
  //     idPaciente: paciente.id,
  //     usuarioAuditoria,
  //     transaccion,
  //   })
  //   return { id: controlSave.id }
  // }

  async crearControles({
    idMedico,
    idPacientes,
    usuarioAuditoria,
    transaccion,
  }: {
    idMedico: string
    idPacientes: Array<string>
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.crearControles({
          idMedico,
          idPacientes,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }
      return await this.asignacionRepositorio.runTransaction(op)
    }

    const medico = await this.medicosService.obtenerMedico(
      idMedico,
      transaccion
    )

    for (const idPaciente of idPacientes) {
      const paciente = await this.pacientesService.obtenerPaciente(
        idPaciente,
        transaccion
      )

      const asignacion = await this.asignacionRepositorio.buscarPorPaciente(
        idPaciente,
        transaccion
      )
      const historiaClinica =
        await this.historiaClinicaService.buscarPorPaciente(
          idPaciente,
          transaccion
        )

      if (!historiaClinica) {
        await this.historiaClinicaService.crearHistoriaClinica({
          idMedico: medico.id,
          idPaciente,
          usuarioAuditoria,
          transaccion,
        })
      }

      if (asignacion) {
        if (asignacion.idMedico !== idMedico) {
          await this.asignacionRepositorio.actualizar({
            id: asignacion.id,
            datosDto: { estado: AsignacionEstado.INACTIVO },
            usuarioAuditoria,
          })
        }
      } else {
        await this.asignacionRepositorio.crear({
          idMedico: medico.id,
          idPaciente: paciente.id,
          usuarioAuditoria,
          transaccion,
        })
      }
    }
  }
}
