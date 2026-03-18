import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveEsSupervisorAndAddOperationalRoles1768766400000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE usuarios.usuarios_roles
      DROP COLUMN IF EXISTS es_supervisor;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE usuarios.usuarios_roles
      ADD COLUMN IF NOT EXISTS es_supervisor boolean NOT NULL DEFAULT false;
    `)
  }
}
