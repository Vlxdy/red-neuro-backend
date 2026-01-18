import { UtilService } from '@/common/lib/util.service'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import 'bootstrap/env'
import { AuditoriaEntity } from '@/common/entity/auditoria.entity'
import { PacienteEstado } from '../constants'
import { Cita } from '@/application/citas/entities/cita.entity'

@Check(UtilService.buildStatusCheck(PacienteEstado))
@Entity({ name: 'pacientes', schema: process.env.DB_SCHEMA })
export class Paciente extends AuditoriaEntity<PacienteEstado> {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Clave primaria de la tabla Pacientes',
  })
  id: string

  @Column({
    length: 100,
    type: 'varchar',
    nullable: false,
    comment: 'Nombres del paciente',
  })
  nombres: string

  @Column({
    name: 'primer_apellido',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Primer apellido del paciente',
  })
  primerApellido?: string | null

  @Column({
    name: 'segundo_apellido',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Segundo apellido del paciente',
  })
  segundoApellido?: string | null

  @Column({
    name: 'nro_documento',
    length: 50,
    nullable: true,
    type: 'varchar',
    comment: 'Número de documento del paciente',
  })
  nroDocumento?: string | null

  @Column({
    name: 'fecha_nacimiento',
    type: 'date',
    nullable: true,
    comment: 'Fecha de nacimiento del paciente',
  })
  fechaNacimiento?: Date | null

  @Column({
    length: 50,
    type: 'varchar',
    nullable: true,
    comment: 'Teléfono de contacto del paciente',
  })
  telefono?: string | null

  @Column({
    length: 15,
    type: 'varchar',
    nullable: true,
    comment: 'Género del paciente',
  })
  genero?: string | null

  @Column({
    length: 255,
    type: 'varchar',
    nullable: true,
    comment:
      'Observaciones o información adicional del paciente no registrada en otros campos',
  })
  observacion?: string | null

  @OneToMany(() => Cita, (cita) => cita.paciente)
  citas: Cita[]

  constructor(data?: Partial<Paciente>) {
    super(data)
    Object.assign(this, data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || PacienteEstado.ACTIVO
  }
}
