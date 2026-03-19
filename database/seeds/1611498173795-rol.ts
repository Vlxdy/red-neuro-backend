import { RolEnum } from '@/core/authorization/rol.enum'
import { Rol } from '@/core/authorization/entity/rol.entity'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { USUARIO_SISTEMA } from '@/common/constants'

export class rol1611498173795 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const items = [
      {
        // id: '1',
        rol: RolEnum.ADMINISTRADOR,
        nombre: 'Administrador',
        descripcion:
          'Responsable de la gestión y supervisión general del sistema.',
      },
      {
        // id: '2',
        rol: RolEnum.JEFE,
        nombre: 'Jefe',
        descripcion:
          'Responsable de la supervisión operativa integral del sistema.',
      },
      {
        // id: '3',
        rol: RolEnum.COORDINADOR,
        nombre: 'Coordinador',
        descripcion:
          'Responsable de coordinar la operación de citas, pacientes y consulta de personal.',
      },
      {
        // id: '4',
        rol: RolEnum.PERSONAL,
        nombre: 'Personal',
        descripcion:
          'Usuario operativo con acceso a sus citas y pacientes asignados.',
      },
      {
        // id: '5',
        rol: RolEnum.PROFESIONAL_INVITADO,
        nombre: 'Profesional invitado',
        descripcion:
          'Profesional externo con acceso exclusivo a sus citas y pacientes asignados.',
      },
    ]
    const roles = items.map((item) => {
      return new Rol({
        rol: item.rol,
        nombre: item.nombre,
        descripcion: item.descripcion,
        estado: 'ACTIVO',
        transaccion: 'SEEDS',
        usuarioCreacion: USUARIO_SISTEMA,
      })
    })
    await queryRunner.manager.save(roles)
  }

  /* eslint-disable */
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
