# Integración de los nuevos listados de citas en el frontend

Este documento describe cómo consumir los nuevos endpoints de citas agregados al backend y brinda recomendaciones para incorporarlos en las vistas de administración, nutricionistas y pacientes.

## Resumen de endpoints

| Endpoint | Método | Descripción |
| --- | --- | --- |
| `/citas/rango-fechas` | `GET` | Devuelve todas las citas visibles para el usuario autenticado dentro de un rango de fechas y con filtros opcionales por estado, paciente o nutricionista (según rol). |
| `/citas/agenda` | `GET` | Retorna las citas paginadas ordenadas del más reciente al más antiguo, con filtros opcionales por día, estado, paciente, nutricionista y búsqueda textual. |

Ambos endpoints respetan el rol del usuario autenticado:

- **Administrador**: visualiza todas las citas sin restricciones.
- **Nutricionista**: visualiza las citas de los pacientes asignados a su perfil.
- **Paciente**: visualiza exclusivamente sus citas.

## `/citas/rango-fechas`

### Parámetros de consulta

- `fechaInicio` (`string`, opcional): fecha de inicio del rango en formato ISO 8601.
- `fechaFin` (`string`, opcional): fecha final del rango en formato ISO 8601.
- `estados` (`string[]`, opcional): arreglo con los valores del enum `CitasEstado` (`BORRADOR`, `PENDIENTE`, `APROBADA`, `RECHAZADA`, `CANCELADA`, `COMPLETADA`, `NO_ASISTIO`).
- `idPaciente` (`string`, opcional, solo administrador/nutricionista): filtra las citas del paciente indicado.
- `idMedico` (`string`, opcional, solo administrador): filtra las citas atendidas por el nutricionista indicado.

Si no se envían `fechaInicio` ni `fechaFin`, el backend devolverá automáticamente las citas del mes calendario actual usando `dayjs`.

### Recomendaciones de UI

1. **Selector de rango**: utilizar un componente de selección de rango que envie ambos límites. Si el usuario solo elige una fecha, enviar el mismo valor en ambos parámetros para limitar la búsqueda a ese día.
2. **Filtro por estado**: mostrar un selector múltiple con los estados disponibles. Almacenar la selección en el estado global para sincronizar con otras vistas si es necesario.
3. **Manejo de carga**: mostrar un skeleton o spinner mientras se espera la respuesta, especialmente para rangos amplios.
4. **Control de errores**: validar el formato de las fechas antes de realizar la petición y capturar respuestas 400 para informar al usuario.

### Ejemplo de consumo

```ts
const fetchCitasPorRango = async (params: {
  fechaInicio?: string
  fechaFin?: string
  estados?: string[]
  idPaciente?: string
  idMedico?: string
}) => {
  const query = new URLSearchParams()
  if (params.fechaInicio) query.append('fechaInicio', params.fechaInicio)
  if (params.fechaFin) query.append('fechaFin', params.fechaFin)
  params.estados?.forEach((estado) => query.append('estados', estado))
  if (params.idPaciente) query.append('idPaciente', params.idPaciente)
  if (params.idMedico) query.append('idMedico', params.idMedico)

  const response = await apiClient.get(`/citas/rango-fechas?${query.toString()}`)
  return response.data.datos
}
```

## `/citas/agenda`

Este endpoint está pensado para vistas tipo agenda o bandeja de citas con opción de filtrar por día completo.

### Parámetros de consulta

Hereda los parámetros de `PaginacionQueryDto`:

- `pagina` (`number`, opcional, mínimo 1).
- `limite` (`number`, opcional, entre 10 y 50).
- `orden` (`string`, opcional): permite ordenar usando `fechaInicio`, `fechaFin`, `estado`, `paciente` o `medico`. Para orden descendente anteponer `-` (por ejemplo, `-fechaInicio`).
- `filtro` (`string`, opcional): término de búsqueda aplicado sobre detalle de la cita, nombre del paciente o del nutricionista.
- `idPaciente` (`string`, opcional, solo administrador/nutricionista): filtra las citas del paciente indicado.
- `idMedico` (`string`, opcional, solo administrador): filtra las citas atendidas por el nutricionista indicado.

Campos adicionales:

- `fecha` (`string`, opcional): día a consultar en formato ISO 8601. Si no se envía no se limita por fecha.
- `estados` (`string[]`, opcional): arreglo con los estados del enum `CitasEstado`.

> **Orden por defecto:** si no se envía el parámetro `orden`, el backend devuelve las citas ordenadas por `fechaInicio` descendente (de la más reciente a la más antigua).

### Recomendaciones de UI

1. **Vista diaria**: establecer la fecha seleccionada en un componente calendario y enviar el valor ISO al backend al cambiar el día.
2. **Paginación**: sincronizar `pagina` y `limite` con controles de tabla. Mostrar la cantidad total (`datos.total`) para renderizar la paginación.
3. **Ordenamiento**: integrar los encabezados de columnas con el parámetro `orden` usando el prefijo `-` para descender.
4. **Búsqueda inmediata**: disparar la búsqueda al detener la escritura (debounce) para evitar llamadas innecesarias.
5. **Estados múltiples**: igual que el endpoint anterior, permitir seleccionar varios estados.

### Ejemplo de consumo

```ts
const fetchAgenda = async (params: {
  pagina?: number
  limite?: number
  orden?: string
  filtro?: string
  fecha?: string
  estados?: string[]
  idPaciente?: string
  idMedico?: string
}) => {
  const query = new URLSearchParams()
  if (params.pagina) query.append('pagina', params.pagina.toString())
  if (params.limite) query.append('limite', params.limite.toString())
  if (params.orden) query.append('orden', params.orden)
  if (params.filtro) query.append('filtro', params.filtro)
  if (params.fecha) query.append('fecha', params.fecha)
  params.estados?.forEach((estado) => query.append('estados', estado))
  if (params.idPaciente) query.append('idPaciente', params.idPaciente)
  if (params.idMedico) query.append('idMedico', params.idMedico)

  const response = await apiClient.get(`/citas/agenda?${query.toString()}`)
  return response.data.datos
}
```

### Presentación sugerida

- **Tabla / Lista**: mostrar columnas para hora, paciente, nutricionista, estado y acciones.
- **Colores por estado**: asignar badges con códigos de color para facilitar la lectura rápida.
- **Acciones contextuales**: habilitar botones según el rol (por ejemplo, reprogramar o cancelar) utilizando la información del usuario autenticado.

## Consideraciones generales

- Mantener sincronizada la zona horaria del frontend con el backend (usar `dayjs` con la misma configuración de UTC si aplica).
- Cachear o memorizar los filtros seleccionados para mejorar la experiencia del usuario al navegar entre vistas.
- Documentar en el frontend los posibles estados y mensajes de error para brindar retroalimentación clara.
- Cubrir con pruebas de integración o mocks los distintos escenarios de roles y filtros para asegurar que las vistas muestren la información correcta.

Con estas pautas, la integración de los nuevos servicios permitirá construir vistas de agenda y reportes de citas más robustas y alineadas con las necesidades de cada rol.
