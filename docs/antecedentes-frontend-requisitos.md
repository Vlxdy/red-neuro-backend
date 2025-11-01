# Historias de usuario y criterios de aceptación - Antecedentes clínicos

## Historia 1: Captura inicial de antecedentes
**Como** nutricionista asignado a una historia clínica
**Quiero** completar el formulario guiado de antecedentes en diferentes sesiones
**Para** registrar la información clínica del paciente manteniendo un borrador seguro.

### Criterios de aceptación
- Al ingresar a la historia clínica debo poder consultar la versión vigente de antecedentes mediante `GET /historias-clinicas/{id}/antecedentes`.
- Si no existe registro previo el formulario debe inicializarse vacío y permitir el guardado en estado **BORRADOR** consumiendo `POST /historias-clinicas/{id}/antecedentes`.
- El front-end debe validar campos condicionados:
  - `descripcionEnfermedad` visible y obligatoria solo cuando `enfermedadDiagnosticada` sea `true`.
  - `descripcionTratamiento` visible y obligatoria cuando `sigueTratamiento` sea `true`.
  - `descripcionCirugia` visible y obligatoria cuando `tieneCirugia` sea `true`.
- Debe permitirse guardar parciales usando `PATCH /historias-clinicas/{id}/antecedentes`; los mensajes de éxito deben reflejar el último guardado.
- El estado **BORRADOR** debe mostrarse visualmente en la UI y bloquear la creación de nuevas versiones.

## Historia 2: Cierre y auditoría de antecedentes
**Como** nutricionista
**Quiero** cerrar un antecedente cuando toda la información esté completa
**Para** habilitar el versionado y contar con una auditoría del origen de los datos.

### Criterios de aceptación
- El botón “Cerrar antecedentes” debe estar disponible solo cuando el estado actual sea **BORRADOR**.
- Al confirmar, se debe enviar `PUT /historias-clinicas/{id}/antecedentes/cierre` incluyendo opcionalmente `motivoActualizacion` y `fuenteDatos`.
- Tras el cierre la UI debe mostrar el estado **COMPLETO**, la fecha de cierre y bloquear ediciones directas (solo lectura).
- El historial debe recargarse con `GET /historias-clinicas/{id}/antecedentes/versiones` y resaltar la versión cerrada como vigente.
- Si el backend responde con error de precondición, la UI debe notificar al usuario que existe un borrador pendiente o que la versión ya está cerrada.

## Historia 3: Versionado por reevaluación
**Como** nutricionista durante un seguimiento
**Quiero** generar una nueva versión de antecedentes vinculada a una evaluación nutricional
**Para** mantener trazabilidad de cambios relevantes.

### Criterios de aceptación
- Desde la sección de reevaluación se debe permitir crear nueva versión enviando `POST /historias-clinicas/{id}/antecedentes` con `idEvaluacionNutricionalOrigen` y `motivoActualizacion`.
- Previo a la creación el front-end debe confirmar que no existan versiones en estado **BORRADOR**. Si la API responde con `Messages.ANTECEDENTE_DRAFT_EXISTS`, se debe mostrar un mensaje e impedir la acción.
- Al listar versiones (`GET /historias-clinicas/{id}/antecedentes/versiones`) se deben ordenar por versión descendente mostrando: versión, fecha de creación, estado, fuente de datos y motivo de actualización.
- El usuario podrá seleccionar cualquier versión y el front-end consumirá `GET /historias-clinicas/{id}/antecedentes/versiones/{version}` para mostrarla en modo solo lectura.

## Historia 4: Gestión de archivos de respaldo
**Como** nutricionista
**Quiero** adjuntar y gestionar documentos de respaldo a cada versión de antecedentes
**Para** disponer de estudios clínicos relacionados con los cambios registrados.

### Criterios de aceptación
- En antecedentes en estado **BORRADOR** o **COMPLETO** se debe permitir adjuntar archivos usando `POST /historias-clinicas/{id}/antecedentes/{version}/archivos` enviando `nombreArchivo`, `tipoArchivo`, `contenidoBase64` y metadatos.
- Los archivos listados en el detalle de antecedentes deben reflejar únicamente aquellos con estado activo devueltos por el backend.
- Cada archivo debe permitir eliminación lógica mediante `DELETE /historias-clinicas/{id}/antecedentes/{version}/archivos/{archivoId}` y actualizar inmediatamente la lista en el front-end.
- Al adjuntar un archivo exitosamente, la UI debe actualizar el listado sin recargar toda la página; ante error se mostrará el mensaje retornado por la API.

## Historia 5: Visibilidad para pacientes
**Como** paciente autenticado
**Quiero** consultar la versión vigente de mis antecedentes
**Para** conocer la información clínica registrada por mi nutricionista.

### Criterios de aceptación
- El front-end del paciente debe consumir `GET /historias-clinicas/{id}/antecedentes` y mostrar únicamente datos en estado **COMPLETO**.
- Los campos sensibles (motivo de actualización, fuente de datos) deben visualizarse solo cuando `fuenteDatos = PACIENTE` o cuando exista configuración de permisos que lo permita.
- Si no existe versión completa, la UI debe mostrar un mensaje informativo indicando que los antecedentes están en proceso de captura.
