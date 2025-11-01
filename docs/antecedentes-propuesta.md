# Propuesta de rediseño del módulo de antecedentes

## Objetivo
Garantizar que la captura y consulta de antecedentes clínicos sea consistente, completa y reutilizable a lo largo del ciclo de vida de la historia clínica, permitiendo a profesionales y pacientes revisar cambios históricos y anexos relevantes.

## Cuándo se debe registrar
1. **Creación de historia clínica:**
   - Se genera un registro de antecedentes vacío vinculado a la historia clínica recién creada.
   - Se audita al usuario (nutriólogo o asistente) que crea la historia clínica.
2. **Primera consulta presencial/virtual:**
   - Se solicita el llenado completo de los antecedentes como parte del intake inicial.
   - Se habilita guardado parcial (borrador) para permitir completar posteriormente.
3. **Seguimientos posteriores:**
   - Durante reevaluaciones nutricionales o actualización de información relevante, se permite actualizar los antecedentes existentes conservando el historial de cambios.
   - Se deja registro de motivos de actualización y se vinculan a la evaluación nutricional que originó el cambio.

## Datos a almacenar
- **Datos clínicos actuales** (ya contemplados en `CreateAntecedenteDto`).
- **Metadatos adicionales propuestos:**
  - `estadoRegistro`: `BORRADOR | COMPLETO | OBSOLETO`.
  - `motivoActualizacion`: texto corto que explique la modificación.
  - `idEvaluacionNutricionalOrigen`: relacionar con evaluaciones periódicas.
  - `version`: número incremental para facilitar auditoría.
  - `fechaUltimaActualizacion` y `usuarioModificacion` (ya soportado parcialmente por entidad base).
  - `fuenteDatos`: `PACIENTE | PROFESIONAL | IMPORTACION`.
  - `archivos`: lista de anexos relacionados (resultados de laboratorio, órdenes médicas, etc.).
- **Auditoría detallada:**
  - Registro en bitácora (tabla historial) con diferencias de cada actualización.

## Flujo de registro y actualización
1. **Inicialización automática:**
   - Endpoint de creación de historia clínica invoca `crearAntecedente` con datos mínimos (`estadoRegistro = BORRADOR`).
   - Se envía notificación al profesional para completar la información.
2. **Captura guiada:**
   - Formulario dividido en secciones (familiares, gastrointestinales, ginecológicos, antecedentes de dieta, anexos).
   - Validaciones dinámicas (ej. solo solicitar `descripcionCirugia` si `tieneCirugia = true`).
   - Guardado parcial mediante `PATCH` que mantiene estado en `BORRADOR`.
   - Al completar todos los campos obligatorios, se marca `estadoRegistro = COMPLETO`.
3. **Actualizaciones programadas:**
   - Cada reevaluación nutricional presenta los antecedentes previos para revisión.
   - Si se detecta cambio relevante, se crea nueva versión (`version++`) y se marca la anterior como `OBSOLETO`.
   - Se registra `motivoActualizacion` y se vincula con la evaluación.
4. **Gestión de anexos:**
   - Posibilidad de adjuntar archivos desde antecedentes (usa repositorio de archivos existente).
   - Cada anexo se etiqueta con tipo (`ANALISIS_LAB`, `RECETA_MEDICA`, etc.) y fecha de emisión.
5. **Notificaciones y tareas pendientes:**
   - Cuando un antecedente queda en `BORRADOR`, se genera tarea pendiente para completarlo.
   - Reportes pueden listar historias clínicas con antecedentes incompletos.

## Endpoints propuestos
| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/historias-clinicas/:id/antecedentes` | Inicializa registro de antecedentes (opcionalmente con datos completos). |
| `GET` | `/historias-clinicas/:id/antecedentes` | Obtiene antecedentes vigentes y anexos. |
| `GET` | `/historias-clinicas/:id/antecedentes/versiones` | Lista histórico de versiones con metadatos. |
| `GET` | `/historias-clinicas/:id/antecedentes/:version` | Recupera una versión específica. |
| `PATCH` | `/historias-clinicas/:id/antecedentes` | Actualiza parcialmente un antecedente (borrador). |
| `PUT` | `/historias-clinicas/:id/antecedentes/cierre` | Marca antecedente como completo luego de validaciones finales. |
| `POST` | `/historias-clinicas/:id/antecedentes/:version/archivos` | Adjunta archivo a la versión actual. |
| `DELETE` | `/historias-clinicas/:id/antecedentes/:version/archivos/:archivoId` | Elimina un anexo asociado. |

> **Nota:** Los endpoints pueden convivir con el actual `AntecedenteService`; se sugiere agruparlos en un controlador dedicado (`AntecedentesController`).

## Integración con el resto del sistema
- **Historia clínica:** Antecedentes se consideran un submódulo obligatorio. La creación de historia clínica debe verificar existencia de antecedentes y viceversa.
- **Evaluaciones nutricionales:** Al crear/actualizar una evaluación, se puede requerir confirmación de antecedentes (copia de versión vigente).
- **Planes nutricionales:** Estados digestivos y alergias deben influir en generación automática de planes; se sugiere cachear la versión vigente para cálculos.
- **Sistema de archivos:** Reutilizar servicio de archivos para guardar anexos, garantizando que `idHistoriaClinica` y `idEvaluacionNutricional` se propaguen.
- **Notificaciones:** Utilizar módulo de tareas/alertas para recordar completar antecedentes o verificar cambios relevantes.

## Alineación con la implementación actual (`AntecedenteService`)
- **Creación (`crearAntecedente`)**: extender la lógica existente para permitir inicialización automática con estado `BORRADOR`, validación de existencia de historia clínica y control de concurrencia sobre versiones.
- **Consulta (`buscarAntecedentePorHistoriaClinica`)**: añadir filtros por estado y versión vigente, devolviendo también el listado de anexos y metadatos de auditoría.
- **Formato de respuesta (`formatarRespuestaAntecedente`)**: incorporar los nuevos campos (`estadoRegistro`, `version`, `motivoActualizacion`, `fuenteDatos`) y soportar agrupación por secciones para el front-end.
- **Repositorio (`AntecedenteRepository`)**: agregar métodos complementarios para versionado (`crearVersion`, `listarVersiones`, `adjuntarArchivo`, `marcarObsoleto`) y aprovechar `runTransaction` para operaciones multi-entidad.

## Consideraciones técnicas
- **Transacciones:** Mantener uso de `runTransaction` para asegurar consistencia entre historia clínica, antecedentes y archivos.
- **Validaciones:** Extender DTOs con reglas condicionales (ej. `descripcionTratamiento` requerido cuando `sigueTratamiento = true`).
- **Versionado:** Crear tabla `antecedentes_historial` o reutilizar soft delete + logs para conservar versiones anteriores.
- **Seguridad:** Validar permisos según rol (nutriólogo, asistente, paciente). Permitir lectura parcial a pacientes y edición solo a profesionales.
- **Performance:** Añadir índices por `idHistoriaClinica` y `version`.
- **Auditoría:** Integrar con middleware existente para registrar usuario y timestamps en cada operación.

## Próximos pasos sugeridos
1. Definir migraciones para nuevos campos (`estadoRegistro`, `version`, relaciones con evaluaciones y archivos).
2. Implementar controlador y servicios complementarios (`update`, `listVersions`, `attachFile`).
3. Ajustar front-end para flujo de captura guiada y control de estado.
4. Crear reportes que identifiquen historias clínicas sin antecedentes completos.
5. Documentar nuevos endpoints en Swagger y capacitar al equipo médico en el nuevo flujo.
