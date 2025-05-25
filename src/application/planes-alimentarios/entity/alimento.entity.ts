import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { UtilService } from '@/common/lib/util.service'
import dotenv from 'dotenv'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { AlimentoEstado } from '../constant'

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

  @Column({
    type: 'enum',
    enum: TipoAlimento,
    nullable: false,
    comment: 'Tipo de comida (ej. desayuno, almuerzo, etc.)',
  })
  tipo: TipoAlimento

  @Column({
    type: 'integer',
    nullable: false,
    comment: 'Cantidad de calorías',
  })
  calorias: number

  @Column({
    type: 'integer',
    nullable: false,
    comment: 'Cantidad de grasa (gramos)',
  })
  grasa: number

  @Column({
    type: 'integer',
    nullable: false,
    comment: 'Cantidad de carbohidratos (gramos)',
  })
  carbohidratos: number

  @Column({
    type: 'integer',
    nullable: false,
    comment: 'Cantidad de proteínas (gramos)',
  })
  proteinas: number

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Receta en formato HTML',
  })
  receta: string

  constructor(data?: Partial<Alimento>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || AlimentoEstado.ACTIVO
  }
}
