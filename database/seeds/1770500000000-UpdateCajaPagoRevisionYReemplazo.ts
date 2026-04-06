import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateCajaPagoRevisionYReemplazo1770500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public'

    await queryRunner.query(`
      ALTER TABLE "${schema}"."caja_sesion"
      DROP CONSTRAINT IF EXISTS "chk_caja_estado";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."caja_sesion"
      ADD CONSTRAINT "chk_caja_estado"
      CHECK (_estado IN ('ABIERTA','REVISION','CERRADA'));
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      DROP CONSTRAINT IF EXISTS "chk_cita_pago_estado_pago";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ADD CONSTRAINT "chk_cita_pago_estado_pago"
      CHECK (estado_pago IN ('PENDIENTE','PAGADO','ANULADO','REEMPLAZADO'));
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ADD COLUMN IF NOT EXISTS "id_pago_origen" BIGINT;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      DROP CONSTRAINT IF EXISTS "fk_cita_pago_origen";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ADD CONSTRAINT "fk_cita_pago_origen"
      FOREIGN KEY ("id_pago_origen")
      REFERENCES "${schema}"."cita_pago"("id")
      ON DELETE SET NULL;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public'

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      DROP CONSTRAINT IF EXISTS "fk_cita_pago_origen";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      DROP COLUMN IF EXISTS "id_pago_origen";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      DROP CONSTRAINT IF EXISTS "chk_cita_pago_estado_pago";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ADD CONSTRAINT "chk_cita_pago_estado_pago"
      CHECK (estado_pago IN ('PENDIENTE','PAGADO','ANULADO'));
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."caja_sesion"
      DROP CONSTRAINT IF EXISTS "chk_caja_estado";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."caja_sesion"
      ADD CONSTRAINT "chk_caja_estado"
      CHECK (_estado IN ('ABIERTA','CERRADA'));
    `)
  }
}
