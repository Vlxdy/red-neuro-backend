import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UtilService } from '@/common/lib/util.service'
import dotenv from 'dotenv'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AlimentoEstado, CategoriaAlimento, UnidadMedida } from '../constant'
import { AlimentoPlanNutricional } from './alimento-plan-nutricional.entity'

export enum TipoAlimento {
  DESAYUNO = 'DESAYUNO',
  ALMUERZO = 'ALMUERZO',
  CENA = 'CENA',
  MEDIA_MANIANA = 'MEDIA_MANIANA',
  MEDIA_TARDE = 'MEDIA_TARDE',
}

dotenv.config()

@Entity({
  name: 'alimentos',
  schema: process.env.DB_SCHEMA_PLAN_NUTRICIONAL,
})
@Check(UtilService.buildStatusCheck(AlimentoEstado))
export class Alimento extends AuditoriaEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    name: 'id',
    comment: 'Identificador único del alimento',
  })
  id: string

  @Column({
    type: 'varchar',
    length: 255,
    name: 'url_imagen',
    nullable: true,
    comment: 'URL de la imagen representativa del alimento',
  })
  urlImage: string

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: 'Nombre del alimento',
  })
  nombre: string

  @Column({
    type: 'text',
    nullable: false,
    comment: 'Descripción del alimento',
  })
  descripcion: string

  @Column('decimal', { precision: 10, scale: 2 })
  cantidadReferencial: number

  @Column({
    type: 'enum',
    enum: CategoriaAlimento,
    nullable: false,
    comment: 'Tipo de alimento',
  })
  categoria: CategoriaAlimento

  @Column({
    type: 'enum',
    enum: UnidadMedida,
    nullable: false,
    comment: 'unidad de medida',
  })
  unidadMedida: UnidadMedida

  @Column('decimal', { precision: 10, scale: 2 })
  calorias: number

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Cantidad de grasa (gramos)',
  })
  grasa: number

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Cantidad de carbohidratos (gramos)',
  })
  carbohidratos: number

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: 'Cantidad de proteínas (gramos)',
  })
  proteinas: number

  @OneToMany(() => AlimentoPlanNutricional, (apn) => apn.alimento)
  alimentosPlanNutricional: AlimentoPlanNutricional[]

  constructor(data?: Partial<Alimento>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || AlimentoEstado.ACTIVO
  }
}
