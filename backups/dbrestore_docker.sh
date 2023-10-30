#!/usr/bin/bash

set -e -o errtrace
trap "echo -e '\n\nERROR: Ocurrió un error mientras se ejecutaba el script :(\n\n'" ERR

arg1=${1:-pg16}

dockerContainer="${arg1}"

echo -e "\n\n >>> Restaurando backup de Base de Datos en $dockerContainer...\n"
sleep 2;

echo -e "\nReiniciando el contenedor $dockerContainer...\n";
docker restart $dockerContainer
sleep 2;

echo -e "\nPreparando script...\n";
docker exec $dockerContainer bash -c 'rm -rf /tmp/restore && mkdir /tmp/restore'
docker cp $(dirname "$0")/dbrestore.sh $dockerContainer:/tmp/restore/dbrestore.sh
docker cp $(dirname "$0")/dbrestore.sql $dockerContainer:/tmp/restore/dbrestore.sql
docker cp $(dirname "$0")/*.gz $dockerContainer:/tmp/restore
sleep 2;

echo -e "\nEjecutando script de restauración (dbrestore.sql)...\n";
echo -e "\n ========= dbrestore.sql =========\n";
docker exec $dockerContainer bash -c 'cat /tmp/restore/dbrestore.sql';
echo -e "\n ---------------------------------\n";
docker exec $dockerContainer bash -c 'psql -U postgres -f /tmp/restore/dbrestore.sql'
sleep 2;

echo -e "\nEjecutando script de restauración (dbrestore.sh)...\n";
echo -e "\n ========= dbrestore.sh =========\n";
docker exec $dockerContainer bash -c 'cat /tmp/restore/dbrestore.sh';
echo -e "\n --------------------------------\n";
docker exec $dockerContainer bash -c 'cd /tmp/restore && bash dbrestore.sh'
sleep 2;

echo -e "\nRemoviendo archivos temporales..."
docker exec $dockerContainer bash -c 'rm -rf /tmp/restore'
sleep 2;

echo -e "\n\n >>> ¡Base de datos restaurada con éxito! :)\n"
