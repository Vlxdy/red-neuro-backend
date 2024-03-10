#!/bin/bash

set -e -o errtrace
trap "echo -e '\n\nERROR: Ocurrió un error mientras se ejecutaba el script :(\n\n'" ERR

# Manejo de argumentos para el nombre del contenedor
dockerContainer="${1:-pg16}"

echo -e "\n\n >>> Restaurando backup de Base de Datos en $dockerContainer...\n"
sleep 2;

echo -e "\nReiniciando el contenedor $dockerContainer...\n";
docker restart "$dockerContainer"
sleep 2;

echo -e "\nPreparando script de restauración...\n";
restoreDir="/tmp/restore"

docker exec "$dockerContainer" bash -c "rm -rf $restoreDir && mkdir $restoreDir"
docker cp "$(dirname "$0")/dbrestore.sh" "$dockerContainer:$restoreDir/dbrestore.sh"
docker cp "$(dirname "$0")/dbrestore.sql" "$dockerContainer:$restoreDir/dbrestore.sql"
docker cp "$(dirname "$0")"/*.gz "$dockerContainer:$restoreDir"
sleep 2;

echo -e "\nEjecutando script de restauración (dbrestore.sql)...\n";
echo -e "\n ========= dbrestore.sql =========\n";
docker exec "$dockerContainer" bash -c "cat $restoreDir/dbrestore.sql";
echo -e "\n ---------------------------------\n";
# Manejo de errores al ejecutar el script de restauración
docker exec "$dockerContainer" bash -c "psql -U postgres -f $restoreDir/dbrestore.sql" || { echo -e "\n\nERROR: Falló al ejecutar el script de restauración (dbrestore.sql)\n\n"; exit 1; }
sleep 2;

echo -e "\nEjecutando script de restauración (dbrestore.sh)...\n";
echo -e "\n ========= dbrestore.sh =========\n";
docker exec "$dockerContainer" bash -c "cat $restoreDir/dbrestore.sh";
echo -e "\n --------------------------------\n";
# Manejo de errores al ejecutar el script de restauración
docker exec "$dockerContainer" bash -c "cd $restoreDir && bash dbrestore.sh" || { echo -e "\n\nERROR: Falló al ejecutar el script de restauración (dbrestore.sh)\n\n"; exit 1; }
sleep 2;

echo -e "\nRemoviendo archivos temporales..."
docker exec "$dockerContainer" bash -c "rm -rf $restoreDir"
sleep 2;

echo -e "\n\n >>> ¡Base de datos restaurada con éxito! :)\n"
