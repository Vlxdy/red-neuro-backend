import { MigrationInterface, QueryRunner } from 'typeorm'

export class AllowNullUsuarioRegistroForPendingPago1771200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public'

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ALTER COLUMN "id_usuario_registro" DROP NOT NULL;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      DROP CONSTRAINT IF EXISTS "fk_cita_pago_usuario_registro";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ADD CONSTRAINT "fk_cita_pago_usuario_registro"
      FOREIGN KEY ("id_usuario_registro")
      REFERENCES "${schema}"."usuario"("id")
      ON DELETE SET NULL;
    `)
  }

  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public'

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      DROP CONSTRAINT IF EXISTS "fk_cita_pago_usuario_registro";
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ADD CONSTRAINT "fk_cita_pago_usuario_registro"
      FOREIGN KEY ("id_usuario_registro")
      REFERENCES "${schema}"."usuario"("id")
      ON DELETE RESTRICT;
    `)

    await queryRunner.query(`
      ALTER TABLE "${schema}"."cita_pago"
      ALTER COLUMN "id_usuario_registro" SET NOT NULL;
    `)
  }
}
