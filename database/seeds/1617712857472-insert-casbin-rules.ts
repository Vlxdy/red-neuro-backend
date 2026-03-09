import { runCasbinSeed } from 'database/casbin/casbin.data'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class insertCasbinRules1617712857472 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await runCasbinSeed(queryRunner)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `TRUNCATE TABLE "casbin_rule" RESTART IDENTITY CASCADE`
    )
  }
}
