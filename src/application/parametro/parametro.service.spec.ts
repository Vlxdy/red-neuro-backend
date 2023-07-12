import { Test, TestingModule } from '@nestjs/testing'
import { PaginacionQueryDto } from '../../common/dto/paginacion-query.dto'
import { CrearParametroDto } from './dto/crear-parametro.dto'
import { ParametroRepository } from './parametro.repository'
import { ParametroService } from './parametro.service'
import { TextService } from '../../common/lib/text.service'

const resParametro = {
  id: '1e9215f2-47cd-45e4-a593-4289413503e0',
  codigo: 'COD-1',
  nombre: 'CODIGO 1',
  grupo: 'COD',
}

describe('ParametroService', () => {
  let service: ParametroService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParametroService,
        {
          provide: ParametroRepository,
          useValue: {
            listar: jest.fn(() => [[resParametro], 1]),
            listarPorGrupo: jest.fn(() => [resParametro]),
            crear: jest.fn(() => resParametro),
            buscarCodigo: jest.fn(() => null),
          },
        },
      ],
    }).compile()

    service = module.get<ParametroService>(ParametroService)
  })

  it('[listar] Debería obtener la lista de parametros', async () => {
    const paginacion = new PaginacionQueryDto()
    const parametros = await service.listar(paginacion)

    expect(parametros).toBeInstanceOf(Array)
    expect(parametros.length).toEqual(2)
  })

  it('[listarPorGrupo] Debería obtener la lista de parametros por grupo', async () => {
    const grupo = 'TD'
    const parametros = await service.listarPorGrupo(grupo)
    expect(parametros).toBeInstanceOf(Array)
  })

  it('[crear] Debería crear un nuevo parámetro', async () => {
    const parametro = new CrearParametroDto()
    parametro.codigo = resParametro.codigo
    parametro.nombre = resParametro.nombre
    parametro.grupo = resParametro.grupo
    parametro.descripcion = 'descripcion'

    const usuarioAuditoria = TextService.generateUuid()
    const result = await service.crear(parametro, usuarioAuditoria)
    expect(result).toBeDefined()
    expect(result.codigo).toEqual(parametro.codigo)
  })
})
