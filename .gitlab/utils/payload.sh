#!/bin/bash

# Convertir values.yaml a JSON
values_json=$(yq eval -o=json values.yml)

# Leer las variables de entorno
NAMESPACE=${NAMESPACE:-default}
IR_CHART_REPO_URL=${IR_CHART_REPO_URL:-default}
CI_PROJECT_NAME=${CI_PROJECT_NAME:-default}
IR_CHART_NAME=${IR_CHART_NAME:-default}
IR_CHART_VERSION=${IR_CHART_VERSION:-default}

# Leer el archivo payload.json y reemplazar los valores 
payload=$(jq --arg NAMESPACE "$NAMESPACE" --arg IR_CHART_REPO_URL "$IR_CHART_REPO_URL" --arg IR_CHART_NAME "$IR_CHART_NAME" --arg IR_CHART_VERSION "$IR_CHART_VERSION" --arg CI_PROJECT_NAME "$CI_PROJECT_NAME" \
'.metadata.name = $CI_PROJECT_NAME | .spec.destination.namespace = $NAMESPACE | .spec.source.repoURL = $IR_CHART_REPO_URL | .spec.source.chart = $IR_CHART_NAME | .spec.source.targetRevision = $IR_CHART_VERSION' payload.json)

# Función para aplanar un objeto JSON
flatten() {
    local prefix=$2
    for key in $(jq -r 'keys[]' <<< "$1"); do
        local new_key=$prefix$key
        local value=$(jq -r --arg key "$key" '.[$key]' <<< "$1")
        if [ "$(jq -r 'if type=="object" or type=="array" then true else false end' <<< "$value")" == "true" ]; then
            flatten "$value" "$new_key."
        else
            local parameter=$(jq -n --arg name "$new_key" --arg value "$value" '{name: $name, value: $value}')
            payload=$(jq --argjson parameter "$parameter" '.spec.source.helm.parameters += [$parameter]' <<< "$payload")
        fi
    done
}

# Aplanar y agregar los valores de values.json a payload.spec.source.helm.parameters
flatten "$values_json"

# Escribir el payload final a un archivo
echo "$payload" > final_payload.json
