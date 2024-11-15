-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "parametricas";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "usuarios";

-- CreateTable
CREATE TABLE "parametricas"."parametros" (
    "_estado" VARCHAR(30) NOT NULL,
    "_transaccion" VARCHAR(30) NOT NULL,
    "_usuario_creacion" BIGINT NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" BIGINT,
    "_fecha_modificacion" TIMESTAMP(6),
    "id" BIGSERIAL NOT NULL,
    "codigo" VARCHAR(15) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "grupo" VARCHAR(15) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,

    CONSTRAINT "parametros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyecto"."session" (
    "sid" VARCHAR NOT NULL,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateTable
CREATE TABLE "usuarios"."casbin_rule" (
    "id" SERIAL NOT NULL,
    "ptype" VARCHAR,
    "v0" VARCHAR,
    "v1" VARCHAR,
    "v2" VARCHAR,
    "v3" VARCHAR,
    "v4" VARCHAR,
    "v5" VARCHAR,
    "v6" VARCHAR,

    CONSTRAINT "casbin_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios"."modulos" (
    "_estado" VARCHAR(30) NOT NULL,
    "_transaccion" VARCHAR(30) NOT NULL,
    "_usuario_creacion" BIGINT NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" BIGINT,
    "_fecha_modificacion" TIMESTAMP(6),
    "id" BIGSERIAL NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "url" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "propiedades" JSONB NOT NULL,
    "id_modulo" BIGINT,

    CONSTRAINT "modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios"."personas" (
    "_estado" VARCHAR(30) NOT NULL,
    "_transaccion" VARCHAR(30) NOT NULL,
    "_usuario_creacion" BIGINT NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" BIGINT,
    "_fecha_modificacion" TIMESTAMP(6),
    "id" BIGSERIAL NOT NULL,
    "nombres" VARCHAR(100),
    "primer_apellido" VARCHAR(100),
    "segundo_apellido" VARCHAR(100),
    "tipo_documento" VARCHAR(15) NOT NULL DEFAULT 'CI',
    "tipo_documento_otro" VARCHAR(50),
    "nro_documento" VARCHAR(50) NOT NULL,
    "fecha_nacimiento" DATE,
    "telefono" VARCHAR(50),
    "genero" VARCHAR(15),
    "observacion" VARCHAR(255),
    "uuid_ciudadano" VARCHAR,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios"."refresh_tokens" (
    "id" VARCHAR NOT NULL,
    "grant_id" VARCHAR NOT NULL,
    "iat" TIMESTAMP(6) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios"."roles" (
    "_estado" VARCHAR(30) NOT NULL,
    "_transaccion" VARCHAR(30) NOT NULL,
    "_usuario_creacion" BIGINT NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" BIGINT,
    "_fecha_modificacion" TIMESTAMP(6),
    "id" BIGSERIAL NOT NULL,
    "rol" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios"."usuarios" (
    "_estado" VARCHAR(30) NOT NULL,
    "_transaccion" VARCHAR(30) NOT NULL,
    "_usuario_creacion" BIGINT NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" BIGINT,
    "_fecha_modificacion" TIMESTAMP(6),
    "id" BIGSERIAL NOT NULL,
    "usuario" VARCHAR(50) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "ciudadania_digital" BOOLEAN NOT NULL DEFAULT false,
    "correo_electronico" VARCHAR,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "codigo_desbloqueo" VARCHAR(100),
    "codigo_recuperacion" VARCHAR(100),
    "codigo_transaccion" VARCHAR(100),
    "codigo_activacion" VARCHAR(100),
    "fecha_bloqueo" TIMESTAMP(6),
    "id_persona" BIGINT NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios"."usuarios_roles" (
    "_estado" VARCHAR(30) NOT NULL,
    "_transaccion" VARCHAR(30) NOT NULL,
    "_usuario_creacion" BIGINT NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_modificacion" BIGINT,
    "_fecha_modificacion" TIMESTAMP(6),
    "id" BIGSERIAL NOT NULL,
    "id_rol" BIGINT NOT NULL,
    "id_usuario" BIGINT NOT NULL,

    CONSTRAINT "usuarios_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parametros_codigo_key" ON "parametricas"."parametros"("codigo");

-- CreateIndex
CREATE INDEX "session_expire_idx" ON "proyecto"."session"("expire");

-- CreateIndex
CREATE UNIQUE INDEX "modulos_url_key" ON "usuarios"."modulos"("url");

-- CreateIndex
CREATE UNIQUE INDEX "roles_rol_key" ON "usuarios"."roles"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "roles_descripcion_key" ON "usuarios"."roles"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"."usuarios"("usuario");

-- CreateIndex
CREATE INDEX "usuarios_codigo_recuperacion_idx" ON "usuarios"."usuarios"("codigo_recuperacion");

-- CreateIndex
CREATE INDEX "usuarios_codigo_transaccion_idx" ON "usuarios"."usuarios"("codigo_transaccion");

-- CreateIndex
CREATE INDEX "usuarios_codigo_desbloqueo_idx" ON "usuarios"."usuarios"("codigo_desbloqueo");

-- CreateIndex
CREATE INDEX "usuarios_codigo_activacion_idx" ON "usuarios"."usuarios"("codigo_activacion");

-- AddForeignKey
ALTER TABLE "usuarios"."modulos" ADD CONSTRAINT "modulos_id_modulo_fkey" FOREIGN KEY ("id_modulo") REFERENCES "usuarios"."modulos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios"."usuarios" ADD CONSTRAINT "usuarios_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "usuarios"."personas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios"."usuarios_roles" ADD CONSTRAINT "usuarios_roles_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "usuarios"."roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios"."usuarios_roles" ADD CONSTRAINT "usuarios_roles_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"."usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
