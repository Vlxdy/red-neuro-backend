# Instalación de la Base de Datos

## Para entornos de `producción`

Se recomienda instalar PostgreSQL de forma nativa (sin docker). Ver [PostgreSQL Downloads](https://www.postgresql.org/download/)

Las instrucciones y comandos utilizados para crear desde cero la Base de Datos del proyecto se encuentra en el archivo [dbcreate.sql](./dbcreate.sql).

## Para entornos de `desarrollo` (con docker)

```bash
# Crea una instancia de postgres
docker run --name pg16 -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres:16.0
```

```bash
# Ejemplo 1: bash dbcreate_docker.sh <dockerContainer>
bash dbcreate_docker.sh pg16
```

Donde: `pg16` es el nombre del contenedor.

## Para entornos de `desarrollo` (Con postgres nativo)

Se requiere tener instalado postgres a nivel del sistema operativo con la siguiente configuración:

```bash
# Archivo /etc/postgresql/16/main/pg_hba.conf
local   all     postgres                    md5
```

Ahora si, procedemos a crear la base de datos

```bash
psql -U postgres -f dbcreate.sql
```
