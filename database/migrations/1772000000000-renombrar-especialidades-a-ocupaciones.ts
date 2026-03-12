import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenombrarEspecialidadesAOcupaciones1772000000000
  implements MigrationInterface
{
  name = 'RenombrarEspecialidadesAOcupaciones1772000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."especialidades" RENAME TO "ocupaciones"`
    )
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."ocupaciones" ADD COLUMN IF NOT EXISTS "grado" character varying(80)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."ocupaciones" DROP COLUMN IF EXISTS "grado"`
    )
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."ocupaciones" RENAME TO "especialidades"`
    )
  }
}
