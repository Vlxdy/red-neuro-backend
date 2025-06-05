import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable, PreconditionFailedException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { PacientesService } from '@/application/gestion-pacientes/services/pacientes.service'
import { AsignacionRepository } from '../repositories/asignacion.repository'
import { AsignacionEstado } from '../constant'
import { MedicosService } from './medicos.service'
import { HistoriaClinicaService } from '@/application/historia-clinica/services/historia-clinico.service'

@Injectable()
/**
 * Servicio encargado de gestionar la asignación de pacientes a médicos,
 * así como la creación y actualización de controles y la validación de asignaciones.
 *
 * @remarks
 * Utiliza repositorios y servicios relacionados para manejar la lógica de negocio
 * asociada a la asignación de pacientes, asegurando la integridad de los datos
 * mediante transacciones cuando es necesario.
 *
 * @example
 * ```typescript
 * // Para crear controles de asignación de pacientes a un médico:
 * await asignacionService.crearControles({
 *   idMedico: 'medico123',
 *   idPacientes: ['paciente1', 'paciente2'],
 *   usuarioAuditoria: 'admin'
 * });
 * ```
 *
 * @help
 * Utiliza este servicio para asignar, validar o eliminar la relación entre médicos y pacientes.
 * Si tienes dudas sobre el uso de algún método, consulta la documentación específica de cada función.
 */
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
  async crearAsignaciones({
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
        return await this.crearAsignaciones({
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
        } else {
          await this.asignacionRepositorio.actualizar({
            id: asignacion.id,
            datosDto: { estado: AsignacionEstado.ACTIVO },
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
  async eliminarAsignacion({
    idMedico,
    idPaciente,
    usuarioAuditoria,
    transaccion,
  }: {
    idMedico: string
    idPaciente: string
    usuarioAuditoria: string
    transaccion?: EntityManager
  }) {
    if (!transaccion) {
      const op = async (nuevaTransaccion: EntityManager) => {
        return await this.eliminarAsignacion({
          idMedico,
          idPaciente,
          usuarioAuditoria,
          transaccion: nuevaTransaccion,
        })
      }
      return await this.asignacionRepositorio.runTransaction(op)
    }

    const asignacion = await this.asignacionRepositorio.buscarPorPaciente(
      idPaciente,
      transaccion
    )

    if (!asignacion || asignacion.idMedico !== idMedico) {
      throw new PreconditionFailedException(
        'No existe una asignación activa para el paciente con el médico especificado.'
      )
    }

    if (asignacion) {
      await this.asignacionRepositorio.actualizar({
        id: asignacion.id,
        datosDto: { estado: AsignacionEstado.INACTIVO },
        usuarioAuditoria,
      })
    }
  }
  async verificarAsignacion({
    idMedico,
    idPaciente,
    transaccion,
  }: {
    idMedico: string
    idPaciente: string
    transaccion?: EntityManager
  }): Promise<boolean> {
    const asignacion = await this.asignacionRepositorio.buscarPorPaciente(
      idPaciente,
      transaccion
    )

    return !!asignacion && asignacion.idMedico === idMedico
  }

  async validarAsignacion({
    idMedico,
    idPaciente,
    transaccion,
  }: {
    idMedico: string
    idPaciente: string
    transaccion?: EntityManager
  }): Promise<void> {
    const verificar = await this.verificarAsignacion({
      idMedico,
      idPaciente,
      transaccion,
    })
    if (!verificar) {
      throw new PreconditionFailedException(
        'El paciente no está asignado al médico especificado.'
      )
    }
  }
}
