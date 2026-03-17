import { beforeEach, describe, expect, it, jest } from '@jest/globals'
jest.mock('bootstrap/env', () => ({}), { virtual: true })
import { CitasMedicasService } from './citas-medicas.service'
import { CitasEstado, TipoCita } from '../constants'

describe('CitasMedicasService', () => {
  let service: CitasMedicasService

  beforeEach(() => {
    service = new CitasMedicasService(
      {
        runTransaction: jest.fn(async (cb: any) => cb({})),
        guardarCita: jest.fn(async () => ({})),
        crearHistorialAccion: jest.fn(async () => ({})),
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    )
  })

  it('[eliminarBorrador] debería permitir eliminación lógica para estado BORRADOR y RECHAZADA', async () => {
    const actualizarEstadoCitaSpy = jest
      .spyOn(service, 'actualizarEstadoCita')
      .mockResolvedValue({ id: '1' } as never)

    await service.eliminarBorrador('1', 'audit', 'executor')

    expect(actualizarEstadoCitaSpy).toHaveBeenCalledWith(
      '1',
      { estado: CitasEstado.INACTIVO },
      'audit',
      'executor',
      [CitasEstado.BORRADOR, CitasEstado.RECHAZADA],
      'Eliminación lógica de cita'
    )
  })

  it('[actualizarEstadoCita] debería devolver la cita actualizada sin reconsultar cuando pasa a INACTIVO', async () => {
    const cita = {
      id: '191',
      detalle: 'detalle',
      fechaInicio: new Date('2026-01-01T10:00:00.000Z'),
      fechaFin: new Date('2026-01-01T10:30:00.000Z'),
      estado: CitasEstado.RECHAZADA,
      tipoCita: TipoCita.CONSULTA,
      idPersonal: '2',
      idPaciente: null,
      idConsultorio: null,
      idLugar: null,
      idServicio: null,
      idCitaNueva: null,
      idHistorialCita: null,
      idUsuarioProgramo: null,
      idUsuarioEnvio: null,
    } as never

    jest.spyOn(service, 'obtenerCitaId').mockResolvedValue(cita)
    const obtenerCitaSpy = jest
      .spyOn(service, 'obtenerCita')
      .mockRejectedValue(new Error('No debería reconsultar'))
    ;(service as any).notificarCitaSolicitada = jest.fn(async () => {})

    const result = await service.actualizarEstadoCita(
      '191',
      { estado: CitasEstado.INACTIVO },
      'audit',
      'executor',
      [CitasEstado.BORRADOR, CitasEstado.RECHAZADA],
      'Eliminación lógica de cita'
    )

    expect(result.id).toBe('191')
    expect(result.estado).toBe(CitasEstado.INACTIVO)
    expect(obtenerCitaSpy).not.toHaveBeenCalled()
  })
})
