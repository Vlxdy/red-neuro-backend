import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { Status } from '@/common/constants'
import { HistoriaClinica } from './historia-clinica.entity'

@Entity({
  name: 'antecedentes',
  schema: process.env.DB_SCHEMA_HISTORIA_CLINICA,
})
export class Antecedente extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Identificador único del antecedente',
  })
  id: string

  @Column({
    name: 'tipo',
    type: 'text',
    nullable: false,
    comment: 'Tipo de antecedente (ejemplo: personal, familiar)',
  })
  tipo: string

  @Column({
    name: 'parentesco',
    type: 'text',
    nullable: true,
    comment: 'Parentesco del antecedente (si aplica)',
  })
  parentesco: string

  @Column({
    name: 'enfermedad',
    type: 'text',
    nullable: false,
    comment: 'Nombre de la enfermedad o condición del antecedente',
  })
  enfermedad: string

  @Column({
    name: 'observaciones',
    type: 'text',
    nullable: true,
    comment: 'Observaciones adicionales sobre el antecedente',
  })
  observaciones: string

  @Column({
    name: 'id_historia_clinica',
    type: 'bigint',
    nullable: false,
    comment: 'Identificador del historial clínico asociado',
  })
  idHistoriaClinica: string

  @ManyToOne(() => HistoriaClinica, (historial) => historial.antecedente)
  @JoinColumn({ name: 'id_historia_clinica' })
  historiaClinica: HistoriaClinica

  constructor(data?: Partial<Antecedente>) {
    super(data)
  }
  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || Status.ACTIVE
  }
}
