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
        rol: RolEnum.TECNICO,
        nombre: 'Técnico',
        descripcion:
          'Responsable de herramientas y funciones específicas del sistema.',
      },
      {
        // id: '3',
        rol: RolEnum.USUARIO,
        nombre: 'Usuario',
        descripcion: 'Individuo que utiliza el sistema.',
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
