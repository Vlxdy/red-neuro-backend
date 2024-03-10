#!/bin/bash

# En caso de que algún comando falle (exit = 1) finalizará la ejecución del script y mostrará el siguiente mensaje:
set -e -o errtrace
trap "echo -e '\n\nERROR: Ocurrió un error mientras se ejecutaba el script :(\n\n'" ERR

# Definición de variables
arg1=${1:-pg16}

dockerContainer="$arg1"

# TODO - Aquí definimos las tareas
echo -e "\nReiniciando instancia de docker [$dockerContainer]\n"
docker restart "$dockerContainer"

# Esperando contenedor
echo -e "\nEsperando a que la instancia de docker [$dockerContainer] se inicie correctamente\n";
sleep 1;

# Mensaje final
echo -e "\n - Tarea completada exitosamente :)\n"
