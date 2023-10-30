#!/usr/bin/bash

set -e -o errtrace
trap "echo -e '\n\nERROR: Ocurrió un error mientras se ejecutaba el script :(\n\n'" ERR

arg1=${1:-pg16}

dockerContainer="${arg1}"

echo -e "\n\n >>> Creando backup de la base de datos desde $dockerContainer...\n"
sleep 2;

echo -e "\nPreparando script...\n";
docker exec $dockerContainer bash -c 'rm -rf /tmp/backups && mkdir /tmp/backups'
docker cp $(dirname "$0")/dbbackup.sh $dockerContainer:/tmp/backups/dbbackup.sh
sleep 2;

echo -e "\nEjecutando script para crear el backup...\n";
echo -e "\n ========= dbbackup.sh =========\n";
docker exec $dockerContainer bash -c 'cat /tmp/backups/dbbackup.sh'
echo -e "\n -------------------------------\n";
docker exec $dockerContainer bash -c 'cd /tmp/backups && bash dbbackup.sh'
sleep 2;

echo -e "\nExtrayendo el backup del contenedor...\n";
docker exec $dockerContainer bash -c 'find /tmp/backups -name "*.gz"' | xargs -I {} docker cp $dockerContainer:{} .
sleep 2;

echo -e "\nRemoviendo archivos temporales..."
docker exec $dockerContainer bash -c 'rm -rf /tmp/backups'
sleep 2;

echo -e "\n >>> ¡Backup creado con éxito! :)\n"
