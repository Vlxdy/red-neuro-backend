import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCitaPagoTable1769801000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const schema = process.env.DB_SCHEMA || 'public'

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."caja_sesion" (
        "id" BIGSERIAL PRIMARY KEY,
        "fecha_apertura" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        "fecha_cierre" TIMESTAMP WITHOUT TIME ZONE,
        "monto_apertura" NUMERIC(10,2),
        "monto_cierre_declarado" NUMERIC(10,2),
        "id_usuario_apertura" BIGINT NOT NULL,
        "id_usuario_cierre" BIGINT,
        "_estado" VARCHAR(30) NOT NULL DEFAULT 'ABIERTA',
        "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREAR',
        "_usuario_creacion" BIGINT NOT NULL,
        "_fecha_creacion" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        "_usuario_modificacion" BIGINT,
        "_fecha_modificacion" TIMESTAMP WITHOUT TIME ZONE,
        CONSTRAINT "fk_caja_usuario_apertura" FOREIGN KEY ("id_usuario_apertura")
          REFERENCES "${schema}"."usuario"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_caja_usuario_cierre" FOREIGN KEY ("id_usuario_cierre")
          REFERENCES "${schema}"."usuario"("id") ON DELETE SET NULL,
        CONSTRAINT "chk_caja_estado" CHECK (_estado IN ('ABIERTA','CERRADA'))
      );
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "${schema}"."cita_pago" (
        "id" BIGSERIAL PRIMARY KEY,
        "id_cita" BIGINT NOT NULL,
        "monto" NUMERIC(10,2) NOT NULL,
        "fecha_pago" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        "metodo_pago" VARCHAR(20) NOT NULL,
        "tipo_movimiento" VARCHAR(20) NOT NULL,
        "observacion" VARCHAR(255),
        "id_usuario_registro" BIGINT NOT NULL,
        "id_usuario_anulacion" BIGINT,
        "id_caja_sesion" BIGINT NOT NULL,
        "_estado" VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
        "_transaccion" VARCHAR(30) NOT NULL DEFAULT 'CREAR',
        "_usuario_creacion" BIGINT NOT NULL,
        "_fecha_creacion" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        "_usuario_modificacion" BIGINT,
        "_fecha_modificacion" TIMESTAMP WITHOUT TIME ZONE,
        CONSTRAINT "fk_cita_pago_cita" FOREIGN KEY ("id_cita")
          REFERENCES "${schema}"."citas"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_cita_pago_usuario_registro" FOREIGN KEY ("id_usuario_registro")
          REFERENCES "${schema}"."usuario"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_cita_pago_usuario_anulacion" FOREIGN KEY ("id_usuario_anulacion")
          REFERENCES "${schema}"."usuario"("id") ON DELETE SET NULL,
        CONSTRAINT "fk_cita_pago_caja_sesion" FOREIGN KEY ("id_caja_sesion")
          REFERENCES "${schema}"."caja_sesion"("id") ON DELETE RESTRICT,
        CONSTRAINT "chk_cita_pago_estado" CHECK (_estado IN ('ACTIVO','INACTIVO')),
        CONSTRAINT "chk_cita_pago_metodo" CHECK (metodo_pago IN ('EFECTIVO','QR','TRANSFERENCIA','TARJETA','OTRO')),
        CONSTRAINT "chk_cita_pago_tipo" CHECK (tipo_movimiento IN ('PAGO','AJUSTE','DEVOLUCION'))
      );
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cita_pago_id_cita"
      ON "${schema}"."cita_pago" ("id_cita");
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cita_pago_fecha_pago"
      ON "${schema}"."cita_pago" ("fecha_pago");
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_cita_pago_caja"
      ON "${schema}"."cita_pago" ("id_caja_sesion");
    `)

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_cita_pago_activo_por_cita"
      ON "${schema}"."cita_pago" ("id_cita")
      WHERE "_estado" = 'ACTIVO';
    `)
  }

  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
