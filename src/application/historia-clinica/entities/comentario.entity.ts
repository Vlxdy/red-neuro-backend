import { AuditoriaEntity } from '../../../common/entity/auditoria.entity'
import { Status } from '../../../common/constants'
import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UtilService } from '../../../common/lib/util.service'
import { HistoriaClinica } from '@/application/historia-clinica/entities/historia-clinica.entity'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'

export const ComentarioEstado = {
  ACTIVE: Status.ACTIVE,
  INACTIVE: Status.INACTIVE,
}

@Check(UtilService.buildStatusCheck(ComentarioEstado))
@Entity({ name: 'comentarios', schema: process.env.DB_SCHEMA_HISTORIA_CLINICA })
export class Comentario extends AuditoriaEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Identificador único de comentarios',
  })
  id: string

  @Column({
    type: 'text',
    name: 'contenido',
    comment: 'Contenido del comentario',
  })
  contenido: string

  @Column({
    name: 'id_historia_clinica',
    type: 'bigint',
    nullable: true,
  })
  idHistoriaClinica: string

  @ManyToOne(
    () => HistoriaClinica,
    (historiaClinica) => historiaClinica.comentarios,
    {
      nullable: true,
    }
  )
  @JoinColumn({ name: 'id_historia_clinica', referencedColumnName: 'id' })
  historiaClinica: HistoriaClinica

  @Column({
    name: 'id_usuario_rol',
    type: 'bigint',
    nullable: false,
  })
  idUsuarioRol: string

  @ManyToOne(() => UsuarioRol, (usuarioRol) => usuarioRol.comentarios)
  @JoinColumn({ name: 'id_usuario_rol', referencedColumnName: 'id' })
  usuarioRol: UsuarioRol

  // Replyes
  @Column({
    name: 'id_comentario_padre',
    type: 'bigint',
    nullable: true,
  })
  idComentarioPadre: string

  @ManyToOne(
    () => Comentario,
    (comentarioPadre) => comentarioPadre.respuestas,
    {
      nullable: true,
    }
  )
  @JoinColumn({ name: 'id_comentario_padre', referencedColumnName: 'id' })
  comentarioPadre: Comentario

  @OneToMany(() => Comentario, (respuesta) => respuesta.comentarioPadre)
  respuestas: Comentario[]

  constructor(data?: Partial<Comentario>) {
    super(data)
  }

  @BeforeInsert()
  insertarEstado() {
    this.estado = this.estado || ComentarioEstado.ACTIVE
  }
}
