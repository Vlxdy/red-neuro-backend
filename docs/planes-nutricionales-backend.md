# Endpoints de planes nutricionales

Este documento describe los endpoints disponibles para gestionar planes nutricionales. Incluye los parámetros esperados, las respuestas principales y recomendaciones para el consumo desde el front-end.

## Autenticación

Todas las rutas listadas requieren un `Bearer Token` válido (JWT). Incluya el encabezado `Authorization: Bearer <token>` en cada solicitud.

## Generar previsualización automática

`POST /planes-nutricionales/generar`

Genera un plan nutricional a partir de la última evaluación registrada sin persistirlo. Es útil para mostrar una propuesta editable en el front-end.

### Cuerpo

```json
{
  "idUsuarioRol": "123",
  "fecha": "2025-05-20",
  "reutilizarPlanExistente": true
}
```

- `idUsuarioRol`: identificador del paciente (tabla `usuarios_roles`).
- `fecha`: día para el plan en formato `YYYY-MM-DD`.
- `reutilizarPlanExistente` (opcional): si es `true` y existe un plan activo para esa fecha, el servicio devolverá ese plan en lugar de calcular uno nuevo.

### Respuesta

`200 OK`

```json
{
  "finalizado": true,
  "mensaje": "Operación exitosa",
  "datos": {
    "id": null,
    "fecha": "2025-05-20",
    "idPaciente": "45",
    "idEvaluacionNutricional": "98",
    "caloriasObjetivo": 2100,
    "distribucionMacronutrientes": { ... },
    "distribucionCalorica": { ... },
    "esGeneradoAutomatico": true,
    "recomendaciones": "...",
    "alimentos": [
      {
        "idAlimento": "12",
        "nombre": "Pechuga de pollo",
        "tipo": "ALMUERZO",
        "cantidad": 1.5,
        "calorias": 248
      }
    ],
    "persistido": false
  }
}
```

El campo `persistido` indica que la propuesta aún no está almacenada. El front-end puede presentar esta información y permitir modificaciones antes de invocar el endpoint de creación.

## Crear plan nutricional

`POST /planes-nutricionales`

Crea y persiste un plan. Puede recibir alimentos definidos manualmente o solicitar la generación automática estableciendo `autoGenerar` en `true` (o enviando el array de alimentos vacío).

### Cuerpo

```json
{
  "idUsuarioRol": "123",
  "fecha": "2025-05-20",
  "autoGenerar": true,
  "recomendaciones": "Beber 2 litros de agua",
  "alimentos": [
    {
      "idAlimento": "12",
      "tipo": "ALMUERZO",
      "cantidad": 1.5
    }
  ]
}
```

### Respuesta

`201 Created` con la misma estructura que la previsualización, pero `persistido: true` e `id` con el identificador del plan recién creado.

## Crear múltiples planes

`POST /planes-nutricionales/multiple`

Permite registrar varios planes en una única transacción. El arreglo debe seguir el mismo esquema que el endpoint de creación individual. La respuesta incluye la cantidad de planes persistidos.

## Actualizar plan nutricional

`PATCH /planes-nutricionales/:id`

Actualiza la composición del plan. Puede enviar un nuevo listado de alimentos o solicitar una regeneración completa con `autoGenerar: true`.

### Cuerpo

```json
{
  "autoGenerar": false,
  "recomendaciones": "Añadir caminatas diarias",
  "alimentos": [
    {
      "idAlimento": "8",
      "tipo": "DESAYUNO",
      "cantidad": 1
    }
  ]
}
```

### Respuesta

`200 OK` con la versión actualizada del plan.

## Inactivar plan nutricional

`PATCH /planes-nutricionales/:id/inactivar`

Marca el plan como inactivo. No elimina registros, pero deja de estar disponible para generación automática.

## Consultas

- `GET /planes-nutricionales/:id`: recupera un plan por su identificador.
- `GET /planes-nutricionales/paciente/:idUsuarioRol/fecha/:fecha`: devuelve el plan activo del paciente en la fecha indicada (o `encontrado: false`).
- `GET /planes-nutricionales`: listado paginado de planes activos.
- `GET /planes-nutricionales/paciente/:idUsuarioRol`: listado paginado por paciente.
- `GET /planes-nutricionales/paciente/:idUsuarioRol/carrito-compras?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`: consolida los alimentos de los planes en el rango para construir un carrito de compras.

## Flujo recomendado para el front-end

1. **Seleccionar paciente y fecha.** Utiliza `GET /planes-nutricionales/paciente/:idUsuarioRol/fecha/:fecha` para saber si ya existe un plan activo en esa fecha. Si lo hay, muéstralo directamente con sus valores (`persistido: true`).
2. **Generar propuesta inicial.** Si no hay plan previo o el usuario desea recalcularlo, invoca `POST /planes-nutricionales/generar`. Usa el flag `reutilizarPlanExistente` cuando quieras reutilizar la última versión guardada y evitar sorpresas en la UI.
3. **Renderizar la vista de edición.** Muestra la información devuelta en `datos`: calorías objetivo, distribución por tiempos de comida, macronutrientes escalados y listado de alimentos. El campo `persistido` permite distinguir entre una propuesta y un plan real.
4. **Permitir ajustes manuales.** Habilita que el profesional edite porciones, tiempos de comida o recomendaciones. Si cambia el listado de alimentos, guarda los datos en el mismo formato que espera el endpoint de creación/actualización.
5. **Persistir la decisión.**
   - Para planes nuevos, llama a `POST /planes-nutricionales` con el payload completo. Si el usuario quiere conservar la propuesta generada automáticamente, envía `autoGenerar: true` y omite `alimentos` para que el backend regenere antes de guardar (útil si pasaron varios minutos).
   - Para ediciones, usa `PATCH /planes-nutricionales/:id`. Puedes enviar el arreglo actualizado de alimentos o `autoGenerar: true` para recalcular a partir del contexto clínico más reciente.
6. **Feedback al usuario.** Interpreta la respuesta y muestra confirmaciones/errores. Cada respuesta incluye `persistido` (booleano) y un mensaje. Si el backend respondió con `persistido: false`, informa que los cambios aún no se han guardado.
7. **Carrito de compras y reportes.** Para vistas consolidadas (por ejemplo, compras semanales) llama a `GET /planes-nutricionales/paciente/:idUsuarioRol/carrito-compras` con el rango deseado; combina esta información con los detalles de macronutrientes ya obtenidos para cada día.

### Manejo de estados en la UI

- **Cargando datos clínicos.** Mientras el backend genera la propuesta, muestra un estado de “generando plan” y bloquea la edición de alimentos para evitar inconsistencias.
- **Paciente sin evaluación.** El servicio responde con un error específico (`codigo: SIN_EVALUACION`). Presenta un modal que permita registrar una evaluación antes de continuar.
- **Plan reutilizado.** Si `reutilizarPlanExistente` retorna un plan previo, indica claramente que se trata de una versión guardada y ofrece la opción de recalcular.
- **Validaciones locales.** Puedes validar que la suma de calorías por tiempo coincida con `distribucionCalorica.totalAsignado`, pero no es obligatorio porque el backend realiza la verificación final.

## Notas para el front-end

- `distribucionMacronutrientes` expone objetivos y valores logrados; úsalo para gráficos o tarjetas informativas.
- `distribucionCalorica` ya distribuye las calorías por tiempo de comida (`DESAYUNO`, `ALMUERZO`, etc.). Úsalo para barras de progreso o indicadores diarios.
- Los alimentos llegan con macronutrientes escalados (`macrosPorcion`) y calorías calculadas; evita recalcular en el cliente salvo que cambies la cantidad. Si el usuario modifica una porción, puedes actualizar localmente multiplicando esos macros por el nuevo valor antes de enviarlo al backend.
- Al regenerar un plan desde la UI, confirma con el usuario porque se perderán los cambios no guardados. Tras la regeneración, compara `idEvaluacionNutricional` para informar si la propuesta proviene de una evaluación diferente.
