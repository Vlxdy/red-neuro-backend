import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { HistorialMedico } from './historial-medico.entity'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
// TODO: Revisar si esn ecesario usar esta entidad
@Entity({ name: 'diagnosticos', schema: process.env.DB_SCHEMA })
export class Diagnostico extends AuditoriaEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => HistorialMedico, (historial) => historial.diagnosticos)
  historialMedico: HistorialMedico

  @Column()
  descripcion: string

  @Column({ nullable: true })
  codigoCie10: string

  constructor(data?: Partial<Diagnostico>) {
    super(data)
  }
}
