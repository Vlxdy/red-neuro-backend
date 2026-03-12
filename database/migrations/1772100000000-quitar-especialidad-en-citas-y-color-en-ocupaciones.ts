import { MigrationInterface, QueryRunner } from 'typeorm'

export class QuitarEspecialidadEnCitasYColorEnOcupaciones1772100000000
  implements MigrationInterface
{
  name = 'QuitarEspecialidadEnCitasYColorEnOcupaciones1772100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."citas" DROP COLUMN IF EXISTS "id_especialidad"`
    )
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."ocupaciones" DROP COLUMN IF EXISTS "color_hex"`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."ocupaciones" ADD COLUMN IF NOT EXISTS "color_hex" character varying(7) NOT NULL DEFAULT '#0ea5e9'`
    )
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "${process.env.DB_SCHEMA}"."citas" ADD COLUMN IF NOT EXISTS "id_especialidad" bigint`
    )
  }
}
