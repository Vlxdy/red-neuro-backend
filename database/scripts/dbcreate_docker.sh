#!/bin/bash

set -e -o errtrace
trap "echo -e '\n\nERROR: Ocurrió un error mientras se ejecutaba el script :(\n\n'" ERR

# Manejo de argumentos para el nombre del contenedor
dockerContainer="${1:-pg16}"

echo -e "\n\n >>> Creando Base de datos en $dockerContainer...\n"
sleep 2;

echo -e "\nReiniciando el contenedor $dockerContainer...\n";
docker restart "$dockerContainer"
sleep 2;

echo -e "\nPreparando script de creación...\n";
docker cp "$(dirname "$0")/dbcreate.sql" "$dockerContainer:/tmp/dbcreate.sql"
sleep 2;

echo -e "\nEjecutando script de creación...\n";
echo -e "\n========== dbcreate.sql =========\n";
docker exec "$dockerContainer" bash -c 'cat /tmp/dbcreate.sql'
echo -e "\n---------------------------------\n";
docker exec "$dockerContainer" bash -c 'psql -U postgres -f /tmp/dbcreate.sql'
sleep 2;

echo -e "\n [Éxito]: Base de datos creada en el contenedor $dockerContainer\n"
