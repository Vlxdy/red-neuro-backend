import { describe, expect, it } from '@jest/globals'
import { Status } from '@/common/constants'
import { RolEnum } from '@/core/authorization/rol.enum'
import { formatearUsuarioComoPersonal } from './formateo-personal.utils'

describe('formateo-personal.utils', () => {
  it('usa el estado de usuario y solo expone el rol activo del personal', () => {
    const resultado = formatearUsuarioComoPersonal({
      id: 'usuario-1',
      estado: Status.INACTIVE,
      correoElectronico: 'persona@correo.com',
      ocupacion: 'Neurología',
      persona: {
        nroDocumento: '1234567',
        nombres: 'Ana',
        primerApellido: 'Pérez',
        segundoApellido: 'López',
        fechaNacimiento: '1990-01-01',
        telefono: '70000000',
        genero: 'F',
      },
      usuarioRol: [
        {
          estado: Status.INACTIVE,
          rol: { rol: RolEnum.PERSONAL },
        },
        {
          estado: Status.ACTIVE,
          rol: { rol: RolEnum.COORDINADOR },
        },
      ],
    } as any)

    expect(resultado.estado).toBe(Status.INACTIVE)
    expect(resultado.roles).toEqual([RolEnum.COORDINADOR])
  })
})
