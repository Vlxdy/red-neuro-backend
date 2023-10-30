-- eliminamos la base actual (si existe)
DROP DATABASE IF EXISTS database_db;

-- creamos la nueva base
CREATE DATABASE database_db ENCODING 'UTF-8';

-- configuramos la zona horaria (solo es necesario si utilizamos docker)
ALTER ROLE postgres SET TIMEZONE TO 'America/La_Paz';
