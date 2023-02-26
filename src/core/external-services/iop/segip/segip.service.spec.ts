import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'

import { PersonaDto } from '../../../usuario/dto/persona.dto'
import { SegipService } from './segip.service'
import { plainToClass } from 'class-transformer'
import { HttpModule, HttpService } from '@nestjs/axios'
import {
  AxiosResponse,
  InternalAxiosRequestConfig,
  RawAxiosResponseHeaders,
} from 'axios'

const dataDefaultAxios = {
  headers: {} as RawAxiosResponseHeaders,
  status: 200,
  statusText: '',
  config: {} as InternalAxiosRequestConfig,
}

const makeSuccessResponse = (datosRespuesta: string): AxiosResponse => {
  return {
    data: {
      ConsultaDatoPersonaContrastacionResult: {
        EsValido: 'true',
        Mensaje: 'La consulta se realizó satisfactoriamente',
        TipoMensaje: 'Correcto',
        CodigoRespuesta: '2',
        CodigoUnico: 'NbhtwiGj-6489096',
        DescripcionRespuesta: 'Se encontró un registro',
        ContrastacionEnFormatoJson: datosRespuesta,
      },
    },
    ...dataDefaultAxios,
  }
}

const makeFailedResponse = (): AxiosResponse<any, any> => {
  return {
    data: {
      ConsultaDatoPersonaContrastacionResult: {
        EsValido: 'true',
        Mensaje: 'La consulta se realizó satisfactoriamente',
        TipoMensaje: 'Correcto',
        CodigoRespuesta: '4',
        CodigoUnico: 'NbhtwiGj-6489096',
        DescripcionRespuesta: 'Registro con observacion: HOMONIMIA',
      },
    },
    ...dataDefaultAxios,
  }
}

const datosPersona = {
  nroDocumento: '123112',
  fechaNacimiento: '1999-11-11',
  nombres: 'JUAN',
  primerApellido: 'PEREZ',
  segundoApellido: 'LOPEZ',
}
describe('SegipService', () => {
  let service: SegipService
  let httpService: HttpService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SegipService],
      imports: [HttpModule],
    }).compile()

    service = module.get<SegipService>(SegipService)
    httpService = module.get<HttpService>(HttpService)
  })
  it('[contrastar] Debería retornar finalizado = true, si se logró contrastar todos los datos', async () => {
    const resContrastacion =
      '{"ComplementoVisible":1,"NumeroDocumento":1,"Complemento":2,"Nombres":1,"PrimerApellido":1,"SegundoApellido":1,"FechaNacimiento":1}'
    const response = makeSuccessResponse(resContrastacion)

    jest.spyOn(httpService, 'get').mockImplementation(() => of<any>(response))

    const persona = plainToClass(PersonaDto, datosPersona)
    const respuesta = await service.contrastar(persona)
    expect(respuesta).toBeDefined()
    expect(respuesta).toHaveProperty('finalizado')
    expect(respuesta?.finalizado).toEqual(true)
  })

  it('[contrastar] Debería retornar finalizado = true, si se logró contrastar todos los datos (caso persona con complemento)', async () => {
    const resContrastacion =
      '{"ComplementoVisible":1,"NumeroDocumento":1,"Complemento":1,"Nombres":1,"PrimerApellido":1,"SegundoApellido":1,"FechaNacimiento":1}'
    const response = makeSuccessResponse(resContrastacion)
    jest.spyOn(httpService, 'get').mockImplementation(() => of<any>(response))

    datosPersona.nroDocumento = '123456-1A'
    const persona = plainToClass(PersonaDto, datosPersona)
    const respuesta = await service.contrastar(persona)
    expect(respuesta).toBeDefined()
    expect(respuesta).toHaveProperty('finalizado')
    expect(respuesta?.finalizado).toEqual(true)
  })

  it('[contrastar] Debería retornar finalizado = false, si no algún dato no es correcto', async () => {
    const resContrastacion =
      '{"ComplementoVisible":1,"NumeroDocumento":2,"Complemento":0,"Nombres":0,"PrimerApellido":0,"SegundoApellido":0,"FechaNacimiento":0}'
    const response = makeSuccessResponse(resContrastacion)
    jest.spyOn(httpService, 'get').mockImplementation(() => of<any>(response))

    const persona = plainToClass(PersonaDto, datosPersona)
    const respuesta = await service.contrastar(persona)

    expect(respuesta).toBeDefined()
    expect(respuesta).toHaveProperty('finalizado')
    expect(respuesta?.finalizado).toEqual(false)
  })

  it('[contrastar] Debería retornar finalizado = false, si segip retorna algun codigo distinto de 2 = ENCONTRADO ', async () => {
    const response = makeFailedResponse()
    jest.spyOn(httpService, 'get').mockImplementation(() => of<any>(response))

    const persona = plainToClass(PersonaDto, datosPersona)
    const respuesta = await service.contrastar(persona)

    expect(respuesta).toBeDefined()
    expect(respuesta).toHaveProperty('finalizado')
    expect(respuesta?.finalizado).toEqual(false)
  })
})
