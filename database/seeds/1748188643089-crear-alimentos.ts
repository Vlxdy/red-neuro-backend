import {
  AlimentoEstado,
  CategoriaAlimento,
  UnidadMedida,
} from '@/application/planes-alimentarios/constant'
import { Alimento } from '@/application/planes-alimentarios/entity/alimento.entity'
import { USUARIO_SISTEMA } from '@/common/constants'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CrearAlimentos1748188643089 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const items = [
      {
        nombre: 'Pechuga de pollo',
        descripcion: 'Carne magra rica en proteínas y baja en grasa.',
        cantidadReferencial: 100,
        unidadMedida: UnidadMedida.G,
        categoria: CategoriaAlimento.PROTEINA_ANIMAL,
        calorias: 165,
        grasa: 3,
        carbohidratos: 0,
        proteinas: 31,
        urlImage:
          'https://images.unsplash.com/photo-1604908812336-0032ef8d2ca2?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Avena',
        descripcion: 'Cereal integral rico en fibra y carbohidratos complejos.',
        cantidadReferencial: 40,
        unidadMedida: UnidadMedida.G,
        categoria: CategoriaAlimento.CEREAL,
        calorias: 150,
        grasa: 3,
        carbohidratos: 27,
        proteinas: 5,
        urlImage:
          'https://images.unsplash.com/photo-1613145994443-7a6d9972a4be?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Manzana',
        descripcion: 'Fruta fresca rica en fibra y vitamina C.',
        cantidadReferencial: 1,
        unidadMedida: UnidadMedida.UNIDAD,
        categoria: CategoriaAlimento.FRUTA,
        calorias: 95,
        grasa: 0,
        carbohidratos: 25,
        proteinas: 0,
        urlImage:
          'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Aceite de oliva',
        descripcion:
          'Grasa saludable obtenida de aceitunas, rica en ácidos grasos monoinsaturados.',
        cantidadReferencial: 1,
        unidadMedida: UnidadMedida.CUCHARADITA,
        categoria: CategoriaAlimento.GRASA_SALUDABLE,
        calorias: 40,
        grasa: 4,
        carbohidratos: 0,
        proteinas: 0,
        urlImage:
          'https://www.eldeber.com.bo/sites/default/efsfiles/2025-05/whatsapp-image-2025-05-27-at-9.36.18-am.jpeg',
      },
      {
        nombre: 'Yogurt natural',
        descripcion:
          'Lácteo fermentado bajo en grasa, fuente de proteínas y calcio.',
        cantidadReferencial: 125,
        unidadMedida: UnidadMedida.ML,
        categoria: CategoriaAlimento.LACTEO,
        calorias: 80,
        grasa: 2,
        carbohidratos: 10,
        proteinas: 5,
        urlImage:
          'https://images.unsplash.com/photo-1582452973360-634c60cf9e49?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Lentejas cocidas',
        descripcion: 'Legumbre rica en proteínas vegetales, fibra y minerales.',
        cantidadReferencial: 100,
        unidadMedida: UnidadMedida.G,
        categoria: CategoriaAlimento.LEGUMBRE,
        calorias: 116,
        grasa: 0.4,
        carbohidratos: 20,
        proteinas: 9,
        urlImage:
          'https://images.unsplash.com/photo-1604908554161-3d8c0d1c2b1e?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Espinaca fresca',
        descripcion:
          'Verdura de hoja verde rica en hierro, calcio y antioxidantes.',
        cantidadReferencial: 1,
        unidadMedida: UnidadMedida.TAZA,
        categoria: CategoriaAlimento.VERDURA,
        calorias: 7,
        grasa: 0.1,
        carbohidratos: 1,
        proteinas: 0.9,
        urlImage:
          'https://images.unsplash.com/photo-1584270355151-020d03615f7e?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Banana',
        descripcion:
          'Fruta rica en potasio, ideal para aportar energía rápida.',
        cantidadReferencial: 1,
        unidadMedida: UnidadMedida.UNIDAD,
        categoria: CategoriaAlimento.FRUTA,
        calorias: 105,
        grasa: 0.3,
        carbohidratos: 27,
        proteinas: 1.3,
        urlImage:
          'https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Nueces',
        descripcion:
          'Fruta seca rica en grasas saludables, proteínas y antioxidantes.',
        cantidadReferencial: 30,
        unidadMedida: UnidadMedida.G,
        categoria: CategoriaAlimento.FRUTA_SECA,
        calorias: 200,
        grasa: 20,
        carbohidratos: 4,
        proteinas: 5,
        urlImage:
          'https://images.unsplash.com/photo-1576092768244-90b66c94f87b?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Agua',
        descripcion:
          'Líquido esencial para la hidratación y funciones corporales.',
        cantidadReferencial: 1,
        unidadMedida: UnidadMedida.TAZA,
        categoria: CategoriaAlimento.BEBIDA,
        calorias: 0,
        grasa: 0,
        carbohidratos: 0,
        proteinas: 0,
        urlImage:
          'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Stevia',
        descripcion:
          'Endulzante natural sin calorías derivado de la planta stevia.',
        cantidadReferencial: 1,
        unidadMedida: UnidadMedida.SOBRE,
        categoria: CategoriaAlimento.ENDULZANTE,
        calorias: 0,
        grasa: 0,
        carbohidratos: 0,
        proteinas: 0,
        urlImage:
          'https://images.unsplash.com/photo-1612036780573-6b0f54434206?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Perejil fresco',
        descripcion: 'Condimento natural rico en vitamina K y antioxidantes.',
        cantidadReferencial: 1,
        unidadMedida: UnidadMedida.CUCHARADITA,
        categoria: CategoriaAlimento.CONDIMENTO,
        calorias: 1,
        grasa: 0,
        carbohidratos: 0.2,
        proteinas: 0.1,
        urlImage:
          'https://images.unsplash.com/photo-1587049352845-080c3c0ed3d3?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Queso fresco',
        descripcion: 'Lácteo bajo en grasa, fuente de calcio y proteínas.',
        cantidadReferencial: 30,
        unidadMedida: UnidadMedida.G,
        categoria: CategoriaAlimento.LACTEO,
        calorias: 80,
        grasa: 5,
        carbohidratos: 1,
        proteinas: 6,
        urlImage:
          'https://images.unsplash.com/photo-1582719478470-bc1e7c7b5b9f?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Pan integral',
        descripcion: 'Cereal elaborado con harina integral, rico en fibra.',
        cantidadReferencial: 1,
        unidadMedida: UnidadMedida.REBANADA,
        categoria: CategoriaAlimento.CEREAL,
        calorias: 70,
        grasa: 1,
        carbohidratos: 12,
        proteinas: 3,
        urlImage:
          'https://images.unsplash.com/photo-1604917877939-f2b00be59b57?auto=format&fit=crop&w=600&q=80',
      },
      {
        nombre: 'Huevo cocido',
        descripcion: 'Proteína animal completa, fuente de colina y vitaminas.',
        cantidadReferencial: 1,
        unidadMedida: UnidadMedida.UNIDAD,
        categoria: CategoriaAlimento.PROTEINA_ANIMAL,
        calorias: 78,
        grasa: 5,
        carbohidratos: 0.6,
        proteinas: 6,
        urlImage:
          'https://images.unsplash.com/photo-1612197525698-7c39fa62e420?auto=format&fit=crop&w=600&q=80',
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
