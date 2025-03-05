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
        rol: RolEnum.NUTRICIONISTA,
        nombre: 'Nutricionista',
        descripcion:
          'Profesional de la salud especializado en nutrición y dietética.',
      },
      {
        // id: '3',
        rol: RolEnum.PACIENTE,
        nombre: 'Paciente',
        descripcion: 'Usuario que recibe atención nutricional.',
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
