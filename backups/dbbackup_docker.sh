#!/bin/bash

set -e -o errtrace
trap "echo -e '\n\nERROR: Ocurrió un error mientras se ejecutaba el script :(\n\n'" ERR

# Manejo de argumentos para el nombre del contenedor
dockerContainer="${1:-pg16}"

echo -e "\n\n >>> Creando backup de la base de datos desde $dockerContainer...\n"
sleep 2;

echo -e "\nPreparando script...\n";
backupsDir="/tmp/backups"

docker exec "$dockerContainer" bash -c "rm -rf $backupsDir && mkdir $backupsDir"
docker cp "$(dirname "$0")/dbbackup.sh" "$dockerContainer:$backupsDir/dbbackup.sh"
sleep 2;

echo -e "\nEjecutando script para crear el backup...\n";
echo -e "\n ========= dbbackup.sh =========\n";
docker exec "$dockerContainer" bash -c "cat $backupsDir/dbbackup.sh"
echo -e "\n -------------------------------\n";
# Manejo de errores al ejecutar el script de backup
docker exec "$dockerContainer" bash -c "cd $backupsDir && bash dbbackup.sh" || { echo -e "\n\nERROR: Falló al ejecutar el script de backup\n\n"; exit 1; }
sleep 2;

echo -e "\nExtrayendo el backup del contenedor...\n";
backupFile=$(docker exec "$dockerContainer" bash -c "find $backupsDir -name "*.gz"")
docker cp "$dockerContainer:$backupFile" .
sleep 2;

echo -e "\nRemoviendo archivos temporales..."
docker exec "$dockerContainer" bash -c "rm -rf $backupsDir"
sleep 2;

echo -e "\n >>> ¡Backup creado con éxito! :)\n"
