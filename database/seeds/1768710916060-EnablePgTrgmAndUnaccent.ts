import { MigrationInterface, QueryRunner } from 'typeorm'

export class EnablePgTrgmAndUnaccent1768710916060 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `)

    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS unaccent;
    `)
  }
  //  eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
