# Planes nutricionales – flujo actualizado

Este documento consolida el comportamiento actual del módulo de planes nutricionales en el backend.
Incluye los flujos soportados, reglas de negocio, endpoints y los criterios necesarios para que el
frontend implemente la experiencia de usuario.

## Resumen del flujo

1. **Requisito previo:** Para cualquier generación o persistencia de un plan nutricional debe existir
   al menos una evaluación nutricional registrada para el paciente. En caso contrario el backend
   devuelve un error `412 Precondition Failed` con `codigo: "SIN_EVALUACION"`.
2. **Generación / previsualización:** Los nutricionistas y administradores pueden solicitar una
   propuesta automática (`POST /planes-nutricionales/generar`). El servicio valida la evaluación más
   reciente, calcula objetivos calóricos y macronutrientes, y arma una propuesta de alimentos sin
   persistirla.
3. **Creación / actualización:** Los profesionales pueden persistir la propuesta (`POST` o
   `PATCH /planes-nutricionales/:id`). El backend siempre recalcula en base a la última evaluación
   vigente y almacena la distribución calórica, macronutrientes y recomendaciones personalizadas.
4. **Consulta:** Pacientes, nutricionistas y administradores pueden consultar los planes mediante
   `GET /planes-nutricionales/paciente/:idUsuarioRol` o por fecha. Los pacientes únicamente tienen
   acceso a sus propios planes; el backend bloquea intentos de consultar registros ajenos.
5. **Seguimiento diario del paciente:** El paciente registra comentarios y el checklist de alimentos
   cumplidos a través de `PATCH /planes-nutricionales/:id/seguimiento`. Cada envío reemplaza el estado
   previo. Nutricionistas y administradores pueden consultar esta información junto con el plan.
6. **Carrito de compras:** Se mantiene el consolidado de alimentos entre fechas para construir
   compras semanales (`GET /planes-nutricionales/paciente/:idUsuarioRol/carrito-compras`).

## Roles y permisos

| Recurso / Acción                                                     | Paciente | Nutricionista | Administrador |
|----------------------------------------------------------------------|:--------:|:-------------:|:-------------:|
| Generar, crear, actualizar, inactivar planes                         |    ❌     |       ✅       |       ✅       |
| Consultar plan por fecha o listar sus planes                         |    ✅     |       ✅       |       ✅       |
| Registrar seguimiento diario (`PATCH /:id/seguimiento`)              |    ✅     |       ❌       |       ❌       |
| Listado global (`GET /planes-nutricionales`) y búsqueda por id       |    ❌     |       ✅       |       ✅       |
| Carrito de compras para un paciente                                 |    ✅*    |       ✅       |       ✅       |

> `*` El paciente solo puede solicitar el consolidado de su propio `idUsuarioRol`.

## Endpoints principales

### Generar propuesta automática
- **Ruta:** `POST /planes-nutricionales/generar`
- **Rol:** Nutricionista / Administrador
- **Body:**
  ```json
  {
    "idUsuarioRol": "123",
    "fecha": "2025-05-20",
    "reutilizarPlanExistente": true
  }
  ```
- **Respuesta:** `PlanNutricionalGeneradoResponseDto` con `persistido: false`.
- **Errores:** `412` con `{ "codigo": "SIN_EVALUACION" }` si no existe evaluación previa.

### Crear plan nutricional
- **Ruta:** `POST /planes-nutricionales`
- **Rol:** Nutricionista / Administrador
- **Body:** `CrearPlanNutricionalDto` (permite `autoGenerar` o alimentos manuales).
- **Respuesta:** `201` con el plan persistido (`persistido: true`).

### Actualizar plan nutricional
- **Ruta:** `PATCH /planes-nutricionales/:id`
- **Rol:** Nutricionista / Administrador
- **Body:** `ActualizarPlanNutricionalDto`.
- **Respuesta:** `PlanNutricionalGeneradoResponseDto` actualizado.

### Inactivar plan nutricional
- **Ruta:** `PATCH /planes-nutricionales/:id/inactivar`
- **Rol:** Nutricionista / Administrador

### Registrar seguimiento diario
- **Ruta:** `PATCH /planes-nutricionales/:id/seguimiento`
- **Rol:** Paciente (solo sobre sus planes)
- **Body (`RegistrarSeguimientoPlanDto`):**
  ```json
  {
    "comentario": "Me sentí con mucha energía",
    "items": [
      { "idAlimentoPlanNutricional": "890", "cumplido": true },
      { "idAlimentoPlanNutricional": "891", "cumplido": false }
    ]
  }
  ```
- **Respuesta:** `PlanNutricionalSeguimientoResponseDto` con el comentario, fecha de registro e items
  activos.

### Consultas disponibles
- `GET /planes-nutricionales/:id` – solo profesionales.
- `GET /planes-nutricionales/paciente/:idUsuarioRol/fecha/:fecha` – valida que el paciente solo acceda
  a su propio `idUsuarioRol`.
- `GET /planes-nutricionales` – listado global (profesionales).
- `GET /planes-nutricionales/paciente/:idUsuarioRol` – listado paginado por paciente.
- `GET /planes-nutricionales/paciente/:idUsuarioRol/carrito-compras?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` –
  consolidado de alimentos por rango.

## Modelo de respuesta relevante

```json
{
  "id": "1450",
  "fecha": "2025-05-20",
  "idPaciente": "320",              // id de la asignación paciente-profesional
  "idEvaluacionNutricional": "98",
  "caloriasObjetivo": 2100,
  "distribucionMacronutrientes": { ... },
  "distribucionCalorica": { ... },
  "esGeneradoAutomatico": true,
  "recomendaciones": "Beber 2 L de agua",
  "alimentos": [
    {
      "id": "890",
      "idAlimento": "12",
      "tipo": "DESAYUNO",
      "cantidad": 1.5,
      "calorias": 248,
      "carbohidratos": 35,
      "proteinas": 25,
      "grasa": 10,
      "categoria": "PROTEÍNA ANIMAL",
      "unidadMedida": "g"
    }
  ],
  "seguimiento": {
    "id": "45",
    "comentario": "Día cumplido al 80%",
    "fechaRegistro": "2025-05-20T21:30:00.000Z",
    "items": [
      { "id": "120", "idAlimentoPlanNutricional": "890", "cumplido": true, "fechaRegistro": "2025-05-20T21:30:00.000Z" }
    ]
  },
  "persistido": true
}
```

## Consideraciones para el frontend

- Mostrar un mensaje claro cuando el backend responda con `codigo: SIN_EVALUACION` invitando al
  profesional a registrar una evaluación nutricional antes de continuar.
- La propiedad `seguimiento` aparece únicamente cuando el plan fue persistido y el paciente registró
  información. Si es `null`, no se ha registrado seguimiento.
- El checklist se reemplaza en cada actualización; el frontend debería enviar el estado completo de los
  alimentos marcados.
- Para pacientes, reutilizar el `idUsuarioRol` presente en el JWT para consumir los listados con
  seguridad. Intentos de consultar otro `idUsuarioRol` devolverán `403`.

## Historias de usuario y criterios de aceptación

### HU-01 – Generar propuesta de plan nutricional
- **Como** nutricionista
- **Quiero** generar una previsualización automática del plan diario
- **Para** revisarlo y personalizarlo antes de guardarlo

**Criterios de aceptación**
1. La solicitud exige el `idUsuarioRol` del paciente y la fecha en formato `YYYY-MM-DD`.
2. Si no existe evaluación nutricional activa, se responde `412` con `codigo: SIN_EVALUACION`.
3. La respuesta contiene `persistido: false` y el detalle de alimentos sugeridos.

### HU-02 – Persistir plan nutricional
- **Como** administrador o nutricionista
- **Quiero** guardar la propuesta generada o un plan manual
- **Para** que el paciente cuente con un plan oficial para la fecha indicada

**Criterios de aceptación**
1. Solo roles profesionales pueden invocar `POST` o `PATCH`.
2. El plan siempre referencia la evaluación más reciente y recalcula calorías y macronutrientes.
3. El resultado incluye el campo `seguimiento` (si existe) y `persistido: true`.

### HU-03 – Consultar planes propios
- **Como** paciente
- **Quiero** ver mis planes nutricionales y el estado de cada uno
- **Para** revisar mi historial diario

**Criterios de aceptación**
1. Si el paciente intenta solicitar un `idUsuarioRol` distinto al suyo, el backend responde `403`.
2. `GET /planes-nutricionales/paciente/:idUsuarioRol` retorna solo los planes del paciente autenticado.
3. `GET /planes-nutricionales/paciente/:idUsuarioRol/fecha/:fecha` incluye, cuando exista, el
   seguimiento diario con comentario e items.

### HU-04 – Registrar seguimiento diario
- **Como** paciente
- **Quiero** marcar qué alimentos cumplí y dejar un comentario sobre mi día
- **Para** que mi nutricionista pueda dar seguimiento a mi progreso

**Criterios de aceptación**
1. Solo el paciente puede invocar `PATCH /planes-nutricionales/:id/seguimiento`.
2. Cada envío reemplaza el estado de los items; los alimentos no incluidos se consideran sin marcar.
3. El comentario se guarda sin espacios extra y puede omitirse (`null`).
4. Nutricionistas y administradores visualizan el seguimiento dentro de las respuestas del plan.

## Referencias adicionales
- La documentación previa del módulo fue centralizada en este archivo; cualquier actualización futura
  debe realizarse aquí para mantener una única fuente de verdad.
