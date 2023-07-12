import { Test, TestingModule } from '@nestjs/testing'
import { plainToClass } from 'class-transformer'
import { TextService } from '../../../common/lib/text.service'
import { PersonaRepository } from '../repository/persona.repository'
import { CrearUsuarioDto } from '../dto/crear-usuario.dto'
import { UsuarioRepository } from '../repository/usuario.repository'
import { UsuarioService } from './usuario.service'
import { MensajeriaService } from '../../external-services/mensajeria/mensajeria.service'
import { MensajeriaModule } from '../../external-services/mensajeria/mensajeria.module'
import { NotFoundException, PreconditionFailedException } from '@nestjs/common'
import { AuthorizationService } from '../../authorization/controller/authorization.service'
import { Messages } from '../../../common/constants/response-messages'
import { UsuarioRolRepository } from '../../authorization/repository/usuario-rol.repository'
import { SegipService } from '../../external-services/iop/segip/segip.service'
import { ConfigService } from '@nestjs/config'
import { FiltrosUsuarioDto } from '../dto/filtros-usuario.dto'
import { CrearUsuarioCiudadaniaDto } from '../dto/crear-usuario-ciudadania.dto'
import { ActualizarUsuarioRolDto } from '../dto/actualizar-usuario-rol.dto'
import { RolRepository } from '../../authorization/repository/rol.repository'

const resUsuarioList = {
  id: '1e9215f2-47cd-45e4-a593-4289413503e0',
  usuario: 'USUARIO',
  estado: 'ACTIVO',
  persona: {
    nroDocumento: '123456',
    nombres: 'Juan',
    primerApellido: 'Perez',
    segundoApellido: 'Perez',
  },
  usuarioRol: [
    {
      estado: 'ACTIVO',
      id: '',
      rol: {
        rol: 'ADMINISTRADOR',
      },
    },
  ],
}

const resUsuarioPerfil = {
  id: '1e9215f2-47cd-45e4-a593-4289413503e0',
  usuario: 'USUARIO',
  estado: 'ACTIVO',
  contrasena: '$2b$10$iz67dPnZkJDpaKarHtch6.2kaWyIaKeOf2bqtBuil6N//dBq6wJQS',
  usuarioRol: [
    {
      id: 'b320fe27-5644-5712-8423-198302b01e25',
      estado: 'ACTIVO',
      rol: {
        id: 'b320fe27-5644-5712-8423-198302b01e25',
        rol: 'ADMINISTRADOR',
        estado: 'ACTIVO',
        rolModulo: [
          {
            id: '03c1f916-7f3e-4b93-839b-1e9f7515a278',
            estado: 'ACTIVO',
            modulo: [
              {
                id: 'b320fe27-5644-5712-8423-198302b01e25',
                label: 'Usuarios',
                url: '/usuarios',
                icono: 'mdiAccountCog',
                nombre: 'usuarios',
                estado: 'ACTIVO',
              },
            ],
          },
        ],
      },
    },
  ],
  persona: {
    nroDocumento: '123456',
    nombres: 'Juan',
    primerApellido: 'Perez',
    segundoApellido: 'Perez',
    fechaNacimiento: '2002-02-09T00:00:00.000Z',
    tipoDocumento: 'CI',
  },
}

const resUsuarioCrear = {
  usuario: 'usuario122',
  contrasena: '123',
  persona: {
    nombres: 'juan',
    primerApellido: 'perez',
    segundoApellido: 'perez',
    nroDocumento: '123456122',
    fechaNacimiento: '1911-11-11',
    tipoDocumentoOtro: null,
    telefono: null,
    genero: null,
    observacion: null,
    id: '18002fe5-759c-4493-a025-8cd38b61ffff',
    tipoDocumento: 'CI',
    estado: 'ACTIVO',
  },
  usuarioCreacion: 'd5de12df-3cc3-5a58-a742-be24030482d8',
  fechaActualizacion: '2021-04-12T19:42:13.588Z',
  usuarioActualizacion: null,
  fechaCreacion: '2021-04-12T19:42:13.588Z',
  id: '416be245-aeaa-47c7-bfe0-477961b18eec',
  estado: 'CREADO',
}

const resUsuarioActivar = {
  id: TextService.generateUuid(),
  estado: 'CREADO',
}

const resUsuarioRestaurar = {
  id: TextService.generateUuid(),
  estado: 'ACTIVO',
}

const resModulo = {
  id: 'b320fe27-5644-5712-8423-198302b01e25',
  label: 'Usuarios',
  url: '/usuarios',
  icono: 'manage_accounts',
  nombre: 'usuarios',
  estado: 'ACTIVO',
}

describe('UsuarioService', () => {
  let service: UsuarioService
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        UsuarioService,
        {
          provide: UsuarioRepository,
          useValue: {
            listar: jest.fn(() => [[resUsuarioList], 1]),
            buscarPorId: jest
              .fn()
              .mockReturnValueOnce(resUsuarioPerfil)
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce(resUsuarioPerfil)
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce(resUsuarioPerfil)
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce(resUsuarioPerfil),
            actualizarUsuario: jest.fn().mockReturnValueOnce(resUsuarioPerfil),
            buscarUsuarioRolPorId: jest
              .fn()
              .mockReturnValueOnce(resUsuarioPerfil)
              .mockReturnValueOnce(null)
              .mockReturnValueOnce(resUsuarioPerfil),
            buscarUsuarioPorCI: jest
              .fn()
              .mockReturnValueOnce({ id: TextService.generateUuid() })
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce({ id: TextService.generateUuid() }),
            buscarUsuarioPorCorreo: jest
              .fn()
              .mockReturnValueOnce({ id: TextService.generateUuid() })
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce({ id: TextService.generateUuid() })
              .mockReturnValueOnce(undefined),
            crear: jest.fn(() => resUsuarioCrear),
            // preload: jest.fn(() => resUsuarioActivar),
            findOne: jest
              .fn()
              .mockReturnValueOnce(resUsuarioActivar)
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce({ ...resUsuarioActivar, estado: 'ACTIVO' })
              .mockReturnValueOnce(resUsuarioActivar)
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce(resUsuarioRestaurar)
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce(undefined)
              .mockReturnValueOnce({
                ...resUsuarioActivar,
                correoElectronico: 'fake@mail.com',
              })
              .mockReturnValueOnce({
                ...resUsuarioActivar,
                correoElectronico: 'fake@mail.com',
              }),
            update: jest.fn(() => ({})),
            runTransaction: jest.fn(() => resUsuarioCrear),
          },
        },
        {
          provide: UsuarioRolRepository,
          useValue: {
            activar: jest.fn(() => ({})),
            inactivar: jest.fn(() => ({})),
            crear: jest.fn(() => ({})),
            obtenerRolesPorUsuario: jest.fn(() => [
              { rol: { id: TextService.generateUuid(), estado: 'ACTIVO' } },
            ]),
          },
        },
        {
          provide: MensajeriaService,
          useValue: {
            sendEmail: jest.fn(() => ({ finalizado: true })),
          },
        },
        {
          provide: SegipService,
          useValue: {
            contrastar: jest.fn(() => ({ finalizado: true })),
          },
        },
        {
          provide: PersonaRepository,
          useValue: {},
        },
        {
          provide: AuthorizationService,
          useValue: {
            obtenerPermisosPorRol: jest.fn(() => [resModulo]),
          },
        },
        {
          provide: RolRepository,
          useValue: {},
        },
      ],
      imports: [MensajeriaModule],
    }).compile()

    service = module.get<UsuarioService>(UsuarioService)
  })

  it('[listar] Debería obtener la lista de usuarios', async () => {
    const paginacion = new FiltrosUsuarioDto()
    const usuarios = await service.listar(paginacion)

    expect(usuarios).toBeInstanceOf(Array)
    expect(usuarios.length).toEqual(2)
  })

  it('[buscarUsuarioId] Debería obtener la información relacionada con el usuario', async () => {
    const { id } = resUsuarioPerfil
    const usuarios = await service.buscarUsuarioId(id)

    expect(usuarios).toBeDefined()
    expect(usuarios).toHaveProperty('id')
    expect(usuarios).toHaveProperty('persona')
    expect(usuarios).toHaveProperty('roles')
  })

  it('[buscarUsuarioId] Debería lanzar una excepcion si el usuario no tiene asignados roles', async () => {
    try {
      const { id } = resUsuarioPerfil
      await service.buscarUsuarioId(id)
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  it('[crear] Debería lanzar una excepcion si ya existe un usuario con el mismo nro. de documento', async () => {
    const datosUsuario = {
      usuario: 'usuario122',
      contrasena: '123',
      persona: {
        nombres: 'juan',
        primerApellido: 'perez',
        segundoApellido: 'perez',
        nroDocumento: '123456122',
        fechaNacimiento: '1911-11-11',
      },
    }
    const usuarioDto = plainToClass(CrearUsuarioDto, datosUsuario)
    const usuarioAuditoria = TextService.generateUuid()
    try {
      await service.crear(usuarioDto, usuarioAuditoria)
    } catch (error) {
      expect(error).toBeInstanceOf(PreconditionFailedException)
      expect(error.message).toEqual(Messages.EXISTING_USER)
    }
  })

  it('[crear] Debería lanzar una excepcion si ya existe un usuario con el mismo correo electronico', async () => {
    const datosUsuario = {
      usuario: 'usuario122',
      contrasena: '123',
      persona: {
        nombres: 'juan',
        primerApellido: 'perez',
        segundoApellido: 'perez',
        nroDocumento: '123456122',
        fechaNacimiento: '1911-11-11',
      },
    }
    const usuarioDto = plainToClass(CrearUsuarioDto, datosUsuario)
    const usuarioAuditoria = TextService.generateUuid()
    try {
      await service.crear(usuarioDto, usuarioAuditoria)
    } catch (error) {
      expect(error).toBeInstanceOf(PreconditionFailedException)
      expect(error.message).toEqual(Messages.EXISTING_EMAIL)
    }
  })

  it('[crear] Debería crear un nuevo usuario', async () => {
    const datosUsuario = {
      usuario: 'usuario122',
      contrasena: '123',
      persona: {
        nombres: 'juan',
        primerApellido: 'perez',
        segundoApellido: 'perez',
        nroDocumento: '123456122',
        fechaNacimiento: '1911-11-11',
      },
    }
    const usuarioDto = plainToClass(CrearUsuarioDto, datosUsuario)
    const usuarioAuditoria = TextService.generateUuid()
    const usuario = await service.crear(usuarioDto, usuarioAuditoria)

    expect(usuario).toBeDefined()
    expect(usuario).toHaveProperty('id')
    expect(usuario).toHaveProperty('estado')
  })

  it('[crearConCiudadania] Debería crear un nuevo usuario con bandera ciudadanía', async () => {
    const usuarioDto = new CrearUsuarioCiudadaniaDto()
    usuarioDto.usuario = '7878787'
    usuarioDto.roles = ['d5de12df-3cc3-5a58-a742-be24030482d8']
    usuarioDto.ciudadaniaDigital = true

    const usuarioAuditoria = TextService.generateUuid()
    const usuario = await service.crearConCiudadania(
      usuarioDto,
      usuarioAuditoria
    )

    expect(usuario).toBeDefined()
    expect(usuario).toHaveProperty('id')
    expect(usuario).toHaveProperty('estado')
  })

  it('[crearConCiudadania] Debería retornar una excepcion al tratar de crear un usuario con ciudadania ya existente', async () => {
    const usuarioDto = new CrearUsuarioCiudadaniaDto()
    usuarioDto.usuario = '7878787'
    usuarioDto.roles = ['d5de12df-3cc3-5a58-a742-be24030482d8']
    usuarioDto.ciudadaniaDigital = true

    const usuarioAuditoria = TextService.generateUuid()

    try {
      await service.crearConCiudadania(usuarioDto, usuarioAuditoria)
    } catch (error) {
      expect(error).toBeInstanceOf(PreconditionFailedException)
      expect(error.message).toEqual(Messages.EXISTING_USER)
    }
  })

  it('[activar] Debería activar un usuario en estado CREADO', async () => {
    try {
      const idUsuario = TextService.generateUuid()
      const usuarioAuditoria = TextService.generateUuid()
      const usuario = await service.activar(idUsuario, usuarioAuditoria)

      expect(usuario).toBeDefined()
      expect(usuario).toHaveProperty('id')
      expect(usuario).toHaveProperty('estado')
      expect(usuario.estado).toEqual('PENDIENTE')
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  it('[activar] Debería lanzar una excepcion si el usuario no existe', async () => {
    try {
      const idUsuario = TextService.generateUuid()
      const usuarioAuditoria = TextService.generateUuid()
      await service.activar(idUsuario, usuarioAuditoria)
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  it('[activar] Debería lanzar una excepcion si el usuario no tiene un estado válido para activación', async () => {
    try {
      const idUsuario = TextService.generateUuid()
      const usuarioAuditoria = TextService.generateUuid()
      await service.activar(idUsuario, usuarioAuditoria)
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  it('[inactivar] Debería inactivar un usuario en cualquier estado', async () => {
    try {
      const idUsuario = TextService.generateUuid()
      const usuarioAuditoria = TextService.generateUuid()
      const usuario = await service.inactivar(idUsuario, usuarioAuditoria)

      expect(usuario).toBeDefined()
      expect(usuario).toHaveProperty('id')
      expect(usuario).toHaveProperty('estado')
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  it('[inactivar] Debería lanzar una excepcion si el usuario no existe', async () => {
    try {
      const idUsuario = TextService.generateUuid()
      const usuarioAuditoria = TextService.generateUuid()
      await service.inactivar(idUsuario, usuarioAuditoria)
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  it('[actualizarContrasena] Debería actualizar la contraseña de un usuario autenticado', async () => {
    const idUsuario = TextService.generateUuid()
    const contrasenaActual = TextService.btoa(encodeURI('123'))
    const contrasenaNueva = TextService.btoa(encodeURI('Contr4seN1AS3gur4'))
    const result = await service.actualizarContrasena(
      idUsuario,
      contrasenaActual,
      contrasenaNueva
    )
    expect(result).toBeDefined()
    expect(result).toHaveProperty('id')
  })

  it('[actualizarContrasena] Debería lanzar una excepcion si la contraseña actual es incorrecta', async () => {
    const idUsuario = TextService.generateUuid()
    const contrasenaActual = TextService.btoa(encodeURI('1234'))
    const contrasenaNueva = TextService.btoa(encodeURI('Contr4seN1AS3gur4'))
    try {
      await service.actualizarContrasena(
        idUsuario,
        contrasenaActual,
        contrasenaNueva
      )
    } catch (error) {
      expect(error).toBeInstanceOf(PreconditionFailedException)
    }
  })

  it('[actualizarContrasena] Debería lanzar una excepcion si la contraseña nueva no es segura', async () => {
    const idUsuario = TextService.generateUuid()
    const contrasenaActual = '1234'
    const contrasenaNueva = 'password'
    try {
      await service.actualizarContrasena(
        idUsuario,
        contrasenaActual,
        contrasenaNueva
      )
    } catch (error) {
      expect(error).toBeInstanceOf(PreconditionFailedException)
    }
  })

  it('[restaurarContrasena] Debería restaurar la contraseña de un usuario', async () => {
    try {
      const idUsuario = TextService.generateUuid()
      const usuarioAuditoria = TextService.generateUuid()
      const result = await service.restaurarContrasena(
        idUsuario,
        usuarioAuditoria
      )

      expect(result).toBeDefined()
      expect(result).toHaveProperty('id')
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  it('[restaurarContrasena] Debería lanzar una excepcion si el usuario no existe', async () => {
    try {
      const idUsuario = TextService.generateUuid()
      const usuarioAuditoria = TextService.generateUuid()
      await service.restaurarContrasena(idUsuario, usuarioAuditoria)
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  it('[actualizarDatos] Debería lanzar una excepcion si el usuario no existe 1', async () => {
    const usuarioDto = new ActualizarUsuarioRolDto()
    usuarioDto.correoElectronico = 'fake@gmail.com'
    usuarioDto.roles = ['12323333']
    const idUsuario = TextService.generateUuid()
    const idUsuarioAuditoria = TextService.generateUuid()

    try {
      await service.actualizarDatos(idUsuario, usuarioDto, idUsuarioAuditoria)
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
      expect(error.message).toEqual(Messages.INVALID_USER)
    }
  })

  it('[actualizarDatos] Debería retornar el ID si logra actualizar los registros', async () => {
    const usuarioDto = new ActualizarUsuarioRolDto()
    usuarioDto.correoElectronico = 'fake@gmail.com'
    usuarioDto.roles = ['12323333']
    const idUsuario = TextService.generateUuid()
    const idUsuarioAuditoria = TextService.generateUuid()

    try {
      const usuario = await service.actualizarDatos(
        idUsuario,
        usuarioDto,
        idUsuarioAuditoria
      )

      expect(usuario).toBeDefined()
      expect(usuario).toHaveProperty('id')
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })
})
