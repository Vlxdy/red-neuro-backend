import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdatePlanNutricional1748895000000 implements MigrationInterface {
  private readonly schemaPlan = process.env.DB_SCHEMA_PLAN_NUTRICIONAL || 'public'
  private readonly schemaHistoria = process.env.DB_SCHEMA_HISTORIA_CLINICA || 'public'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${this.schemaPlan}"."planes-nutricionales"
      ADD COLUMN IF NOT EXISTS "id_evaluacion_nutricional" bigint,
      ADD COLUMN IF NOT EXISTS "calorias_objetivo" numeric(8,2),
      ADD COLUMN IF NOT EXISTS "distribucion_macronutrientes" jsonb,
      ADD COLUMN IF NOT EXISTS "distribucion_calorica" jsonb,
      ADD COLUMN IF NOT EXISTS "es_generado_automatico" boolean DEFAULT false
    `)

    await queryRunner.query(`
      ALTER TABLE "${this.schemaPlan}"."planes-nutricionales"
      ADD CONSTRAINT "fk_planes_nutricionales_evaluacion"
      FOREIGN KEY ("id_evaluacion_nutricional")
      REFERENCES "${this.schemaHistoria}"."evaluaciones_nutricionales"("id")
      ON DELETE SET NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${this.schemaPlan}"."planes-nutricionales"
      DROP CONSTRAINT IF EXISTS "fk_planes_nutricionales_evaluacion"
    `)

    await queryRunner.query(`
      ALTER TABLE "${this.schemaPlan}"."planes-nutricionales"
      DROP COLUMN IF EXISTS "id_evaluacion_nutricional",
      DROP COLUMN IF EXISTS "calorias_objetivo",
      DROP COLUMN IF EXISTS "distribucion_macronutrientes",
      DROP COLUMN IF EXISTS "distribucion_calorica",
      DROP COLUMN IF EXISTS "es_generado_automatico"
    `)
  }
}
