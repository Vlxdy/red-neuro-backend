# Actualización de la implementación de antecedentes clínicos

## Resumen de cambios

1. **Gestión de archivos adjuntos sin base64**
   - El endpoint `POST /historias-clinicas/:id/antecedentes/:version/archivos` ahora recibe archivos mediante `multipart/form-data` usando el campo `archivosAdjuntos`.
   - Se reutiliza la configuración de límites, almacenamiento temporal y validaciones empleadas en `POST /historia-clinica/:id/evaluacion-nutricional`.
   - Los archivos se guardan como ficheros físicos en el almacenamiento NFS y se persisten con metadatos; el contenido en Base64 deja de ser requerido.
   - La respuesta del servicio retorna un arreglo de archivos adjuntos con referencias al antecedente correspondiente.

2. **Descarga de archivos de antecedentes**
   - Nuevo endpoint `GET /historias-clinicas/:id/antecedentes/:version/archivos/:archivoId` para recuperar el archivo original respetando permisos de administrador, nutricionista o paciente dueño.
   - Se envía el archivo con cabeceras `Content-Disposition` y `Content-Type` adecuados, soportando tanto archivos almacenados en disco como, en última instancia, contenido base64.

3. **Reglas de captura para datos ginecológicos**
   - Antes de crear o actualizar antecedentes se consulta el género del paciente asociado a la historia clínica.
   - Si el paciente no es femenino, se eliminan del payload los campos ginecológicos (`fechaUltimaMenstruacion`, `menstruacionRegular`, `metodoAnticonceptivo`, `colicos`), almacenando valores nulos para evitar datos inconsistentes.

## Impacto en el frontend

- Para adjuntar documentos se debe enviar un formulario `multipart/form-data` con el campo `archivosAdjuntos` (uno o varios archivos).
- Las interfaces que consumen antecedentes deben considerar que `contenidoBase64` puede ser `null` y que los metadatos incluyen la ruta física y el identificador del antecedente.
- El nuevo endpoint de descarga debe utilizarse para visualizar o descargar archivos; no se debe reconstruir contenido base64 en el cliente.
- Los formularios de antecedentes deben ocultar o deshabilitar los campos ginecológicos cuando el paciente no sea de género femenino, dado que el backend los descartará automáticamente.
