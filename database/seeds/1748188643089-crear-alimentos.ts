import { AlimentoEstado } from '@/application/planes-alimentarios/constant'
import {
  Alimento,
  TipoAlimento,
} from '@/application/planes-alimentarios/entity/alimento.entity'
import { USUARIO_SISTEMA } from '@/common/constants'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CrearAlimentos1748188643089 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const items = [
      {
        urlImage: '',
        nombre: 'Avena con leche',
        descripcion: 'Avena cocida en leche con fruta picada',
        tipo: TipoAlimento.DESAYUNO,
        calorias: 250,
        grasa: 8,
        carbohidratos: 40,
        proteinas: 10,
        receta:
          '<div>Ingredientes: avena, leche, fruta. Preparación: hervir avena con leche, agregar fruta picada.</div>',
      },
      {
        urlImage: '',
        nombre: 'Manzana y nueces',
        descripcion: 'Manzana fresca con nueces',
        tipo: TipoAlimento.MEDIA_MANIANA,
        calorias: 150,
        grasa: 7,
        carbohidratos: 20,
        proteinas: 2,
        receta:
          '<div>Ingredientes: 1 manzana, 5 nueces. Preparación: lavar y cortar la manzana, servir con nueces.</div>',
      },
      {
        urlImage: '',
        nombre: 'Pollo con arroz integral',
        descripcion:
          'Pechuga de pollo a la plancha con arroz integral y ensalada',
        tipo: TipoAlimento.ALMUERZO,
        calorias: 450,
        grasa: 12,
        carbohidratos: 40,
        proteinas: 35,
        receta:
          '<div>Ingredientes: pollo, arroz, verduras. Preparación: cocinar arroz, dorar el pollo, servir con ensalada.</div>',
      },
      {
        urlImage: '',
        nombre: 'Yogur natural con granola',
        descripcion: 'Yogur bajo en grasa con granola casera',
        tipo: TipoAlimento.MEDIA_TARDE,
        calorias: 180,
        grasa: 6,
        carbohidratos: 20,
        proteinas: 10,
        receta:
          '<div>Ingredientes: yogur, granola. Preparación: servir yogur con granola por encima.</div>',
      },
      {
        urlImage: '',
        nombre: 'Sopa de verduras y pan integral',
        descripcion: 'Sopa ligera con pan integral tostado',
        tipo: TipoAlimento.CENA,
        calorias: 300,
        grasa: 5,
        carbohidratos: 30,
        proteinas: 15,
        receta:
          '<div>Ingredientes: verduras, pan integral. Preparación: hervir verduras, servir con pan.</div>',
      },
      {
        urlImage: '',
        nombre: 'Tostadas con palta y huevo',
        descripcion: 'Pan integral con palta y huevo duro',
        tipo: TipoAlimento.DESAYUNO,
        calorias: 300,
        grasa: 15,
        carbohidratos: 25,
        proteinas: 12,
        receta:
          '<div>Ingredientes: pan integral, palta, huevo. Preparación: tostar pan, agregar palta y huevo cocido en rodajas.</div>',
      },
      {
        urlImage: '',
        nombre: 'Banana y almendras',
        descripcion: 'Banana madura con 10 almendras',
        tipo: TipoAlimento.MEDIA_MANIANA,
        calorias: 180,
        grasa: 8,
        carbohidratos: 20,
        proteinas: 4,
        receta:
          '<div>Ingredientes: banana, almendras. Preparación: pelar banana y servir con almendras.</div>',
      },
      {
        urlImage: '',
        nombre: 'Carne magra con puré y ensalada',
        descripcion: 'Bistec con puré de papa y ensalada de tomate',
        tipo: TipoAlimento.ALMUERZO,
        calorias: 480,
        grasa: 18,
        carbohidratos: 35,
        proteinas: 35,
        receta:
          '<div>Ingredientes: carne, papa, tomate. Preparación: cocer papa, asar carne, preparar ensalada.</div>',
      },
      {
        urlImage: '',
        nombre: 'Galletas integrales y leche',
        descripcion: 'Galletas de avena con leche descremada',
        tipo: TipoAlimento.MEDIA_TARDE,
        calorias: 200,
        grasa: 7,
        carbohidratos: 30,
        proteinas: 8,
        receta:
          '<div>Ingredientes: galletas, leche. Preparación: servir juntos.</div>',
      },
      {
        urlImage: '',
        nombre: 'Ensalada de atún con galletas saladas',
        descripcion: 'Atún en agua con verduras frescas',
        tipo: TipoAlimento.CENA,
        calorias: 320,
        grasa: 10,
        carbohidratos: 25,
        proteinas: 25,
        receta:
          '<div>Ingredientes: atún, lechuga, tomate, galletas. Preparación: mezclar ingredientes y servir con galletas.</div>',
      },
    ]
    const alimentos = items.map((item) => {
      return new Alimento({
        ...item,
        estado: AlimentoEstado.ACTIVO,
        transaccion: 'SEEDS',
        usuarioCreacion: USUARIO_SISTEMA,
      })
    })
    await queryRunner.manager.save(alimentos)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
