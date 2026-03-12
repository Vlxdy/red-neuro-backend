import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenombrarRelacionesAOcupaciones1772200000000
  implements MigrationInterface
{
  name = 'RenombrarRelacionesAOcupaciones1772200000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."usuario_rol_especialidad" RENAME TO "usuario_rol_ocupacion"`
    )
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."usuario_rol_ocupacion" RENAME COLUMN "id_especialidad" TO "id_ocupacion"`
    )

    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."servicio_especialidad" RENAME TO "servicio_ocupacion"`
    )
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."servicio_ocupacion" RENAME COLUMN "id_especialidad" TO "id_ocupacion"`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."servicio_ocupacion" RENAME COLUMN "id_ocupacion" TO "id_especialidad"`
    )
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."servicio_ocupacion" RENAME TO "servicio_especialidad"`
    )

    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."usuario_rol_ocupacion" RENAME COLUMN "id_ocupacion" TO "id_especialidad"`
    )
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."usuario_rol_ocupacion" RENAME TO "usuario_rol_especialidad"`
    )
  }
}
