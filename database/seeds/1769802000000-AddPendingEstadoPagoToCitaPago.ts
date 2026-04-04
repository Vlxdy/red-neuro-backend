import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPendingEstadoPagoToCitaPago1769802000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public'

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ADD COLUMN IF NOT EXISTS "estado_pago" VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE';
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
      ALTER TABLE "${schema}"."cita_pago"
      ALTER COLUMN "fecha_pago" DROP NOT NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ALTER COLUMN "metodo_pago" DROP NOT NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ALTER COLUMN "id_caja_sesion" DROP NOT NULL;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public'

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ALTER COLUMN "id_caja_sesion" SET NOT NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ALTER COLUMN "metodo_pago" SET NOT NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ALTER COLUMN "fecha_pago" SET NOT NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      DROP CONSTRAINT IF EXISTS "chk_cita_pago_estado_pago";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      DROP COLUMN IF EXISTS "estado_pago";
    `)
  }
}
