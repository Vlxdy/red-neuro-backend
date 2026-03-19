import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { PersonalSaludService } from './personal-salud.service'
import { PersonalSaludRepository } from '../repository/personal-salud.repository'
import { UsuarioService } from '@/core/usuario/service/usuario.service'
import { RolEnum, RolEnumId } from '@/core/authorization/rol.enum'
import { Status } from '@/common/constants'

describe('PersonalSaludService', () => {
  let service: PersonalSaludService

  const personalBase: any = {
    id: 'usuario-1',
    estado: Status.ACTIVE,
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
        estado: Status.ACTIVE,
        rol: { rol: RolEnum.PERSONAL },
      },
    ],
  }

  const personalSaludRepository = {
    obtenerPersonalSaludPorId: jest.fn<any>(),
    actualizarOcupacionUsuario: jest.fn<any>(),
  } as unknown as jest.Mocked<PersonalSaludRepository>

  const usuarioService = {
    actualizarDatos: jest.fn<any>(),
  } as unknown as jest.Mocked<UsuarioService>

  beforeEach(() => {
    jest.clearAllMocks()
    service = new PersonalSaludService(personalSaludRepository, usuarioService)
  })

  it('permite actualizar el rol de personal cuando el usuario administrador lo solicita', async () => {
    personalSaludRepository.obtenerPersonalSaludPorId
      .mockResolvedValueOnce(personalBase)
      .mockResolvedValueOnce({
        ...personalBase,
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
      })

    const resultado = await service.actualizarPersonalSalud(
      personalBase.id,
      { rol: RolEnum.COORDINADOR },
      'auditor',
      { rol: RolEnum.ADMINISTRADOR, roles: [RolEnum.ADMINISTRADOR] }
    )

    expect(usuarioService.actualizarDatos).toHaveBeenCalledWith(
      personalBase.id,
      {
        persona: undefined,
        correoElectronico: undefined,
        roles: [RolEnumId.COORDINADOR],
      },
      'auditor'
    )
    expect(resultado.estado).toBe(Status.ACTIVE)
    expect(resultado.roles).toEqual([RolEnum.COORDINADOR])
  })

  it('rechaza actualizar el rol a JEFE cuando la sesión es de un jefe', async () => {
    personalSaludRepository.obtenerPersonalSaludPorId.mockResolvedValue(
      personalBase
    )

    await expect(
      service.actualizarPersonalSalud(
        personalBase.id,
        { rol: RolEnum.JEFE },
        'auditor',
        { rol: RolEnum.JEFE, roles: [RolEnum.JEFE] }
      )
    ).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('lanza not found si no encuentra al personal luego de actualizar', async () => {
    personalSaludRepository.obtenerPersonalSaludPorId
      .mockResolvedValueOnce(personalBase)
      .mockResolvedValueOnce(null)

    await expect(
      service.actualizarPersonalSalud(
        personalBase.id,
        { rol: RolEnum.COORDINADOR },
        'auditor',
        { rol: RolEnum.ADMINISTRADOR, roles: [RolEnum.ADMINISTRADOR] }
      )
    ).rejects.toBeInstanceOf(NotFoundException)
  })
})
