# Instalación de la Base de Datos

Las instrucciones y comandos utilizados para crear desde cero la Base de Datos del proyecto se encuentra en el archivo [dbcreate.sql](./dbcreate.sql).

## Prerequisitos:

- Para entornos de desarrollo (con docker)

```bash
# Crea una instancia de postgres
docker run --name pg16 -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres:16.0
```

- Para entornos de **PRODUCCIÓN**

  Se recomienda instalar PostgreSQL de forma nativa (sin docker). Ver [PostgreSQL Downloads](https://www.postgresql.org/download/)

## Para entornos de `desarrollo` (Con docker)

```bash
# Ejemplo 1: bash createdb_docker.sh <dockerContainer>
bash createdb_docker.sh pg16
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
