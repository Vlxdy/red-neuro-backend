import {
  AlimentoEstado,
  CategoriaAlimento,
  UnidadMedida,
} from '@/application/planes-alimentarios/constant'
import { Alimento } from '@/application/planes-alimentarios/entity/alimento.entity'
import { USUARIO_SISTEMA } from '@/common/constants'
import { MigrationInterface, QueryRunner } from 'typeorm'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config()

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
        urlImage: '/uploads/food/pechuga-pollo.jpg',
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
        urlImage: '/uploads/food/avena.jpg',
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
        urlImage: '/uploads/food/manzana-roja.jpg',
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
        urlImage: '/uploads/food/aceite-oliva.jpg',
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
        urlImage: '/uploads/food/yogurt-natural.jpg',
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
        urlImage: '/uploads/food/lentejas.jpg',
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
        urlImage: '/uploads/food/espinaca.jpg',
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
        urlImage: '/uploads/food/bananas.jpg',
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
        urlImage: '/uploads/food/nueces.jpg',
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
        urlImage: '/uploads/food/agua.jpg',
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
        urlImage: '/uploads/food/stevia.jpg',
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
        urlImage: '/uploads/food/perejil.jpg',
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
        urlImage: '/uploads/food/queso.jpg',
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
        urlImage: '/uploads/food/pan-integral.jpg',
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
        urlImage: '/uploads/food/huevo-cocido.jpg',
      },
    ]

    const srcDir = path.resolve(__dirname, '../assets/food')
    const uploadDir = path.resolve(
      `${process.env.STORAGE_NFS_PATH}/uploads/food`
    )
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    // 🔹 Copiar solo las imágenes necesarias
    for (const item of items) {
      const fileName = path.basename(item.urlImage) // pan-integral.jpg
      const srcFile = path.join(srcDir, fileName)
      const destFile = path.join(uploadDir, fileName)

      try {
        if (!fs.existsSync(srcFile)) {
          console.warn(`⚠️ Imagen no encontrada: ${srcFile}`)
          continue
        }

        // Copiar si no existe ya
        if (!fs.existsSync(destFile)) {
          fs.copyFileSync(srcFile, destFile)
          console.log(`✅ Copiada imagen: ${fileName}`)
        } else {
          console.log(`ℹ️ Ya existe: ${fileName}`)
        }
      } catch (error) {
        console.error(`❌ Error al copiar ${fileName}:`, error)
      }
    }
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
