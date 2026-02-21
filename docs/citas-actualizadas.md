# Gestión de citas (flujo actualizado)

## Objetivo
Este documento describe el flujo actualizado para crear, actualizar y listar citas médicas con selección de especialidad, tipo de cita, estudios asociados y paciente opcional.

## Variables de entorno
| Variable | Descripción | Ejemplo | Valor por defecto |
| --- | --- | --- | --- |
| `CITA_CONSULTA_DURACION_MINUTOS` | Duración base (en minutos) para una cita de tipo **CONSULTA**. | `15` | `15` |

> **Nota:** La fecha fin de la cita se calcula automáticamente usando la duración del servicio seleccionado.

## Flujo funcional
1. **Seleccionar especialidad (opcional).**
   - `idEspecialidad` puede enviarse para reforzar la validación de negocio.
2. **Seleccionar tipo de cita.**
   - `CONSULTA` o `ESTUDIO`.
3. **Si es CONSULTA:**
   - Solo se requiere la fecha de inicio.
   - La fecha fin se calcula usando `CITA_CONSULTA_DURACION_MINUTOS`.
4. **Para cualquier tipo de cita:**
   - Se debe enviar `idServicio` (consulta o estudio).
   - Si se envía `idEspecialidad`, el servicio debe estar asociado a esa especialidad.
   - La fecha fin se calcula usando `duracionMinutos` del servicio.
5. **Asignar paciente (opcional).**
   - La cita puede asociarse a un paciente enviando `idPaciente`.

## Reglas principales
- La fecha fin **no** se envía en solicitudes de creación/actualización; siempre se calcula en backend.
- Un servicio solo es válido si su `tipo` coincide con `tipoCita`.
- Si se envía `idEspecialidad`, debe existir relación N:N entre el servicio y esa especialidad.
- Las respuestas de citas incluyen datos completos de médico y paciente utilizando el formato de `formatearPersonal`.
- En reprogramaciones (CONSULTA o ESTUDIO), se debe enviar `idServicio` para recalcular la duración.

## Endpoints relevantes
- `POST /citas`: crea una cita.
- `PATCH /citas/:id`: actualiza datos generales.
- `PATCH /citas/:id/reprogramar`: reprograma la fecha de inicio (la fecha fin se recalcula).
- `GET /citas`: lista citas.
- `GET /citas/:id`: obtiene detalle de la cita.

## Ejemplos de request
### Crear cita de CONSULTA
```json
{
  "detalle": "Control nutricional mensual",
  "fechaInicio": "2024-06-15T10:00:00Z",
  "idMedico": "42",
  "idEspecialidad": "12",
  "tipoCita": "CONSULTA",
  "idPaciente": "105",
  "idConsultorio": "8",
  "idServicio": "2"
}
```

### Crear cita de ESTUDIO
```json
{
  "detalle": "Evaluación radiológica",
  "fechaInicio": "2024-06-15T10:00:00Z",
  "idMedico": "42",
  "idEspecialidad": "12",
  "tipoCita": "ESTUDIO",
  "idServicio": "5",
  "idPaciente": "105"
}
```

### Reprogramar cita
```json
{
  "fechaInicio": "2024-06-20T12:00:00Z",
  "tipoCita": "CONSULTA",
  "idServicio": "2"
}
```

## Ejemplo de response (resumen)
```json
{
  "id": "10",
  "detalle": "Control nutricional mensual",
  "fechaInicio": "2024-06-15T10:00:00Z",
  "fechaFin": "2024-06-15T10:15:00Z",
  "tipoCita": "CONSULTA",
  "estado": "SOLICITADA",
  "medicoId": "42",
  "pacienteId": "105",
  "especialidadId": "12",
  "consultorioId": "8",
  "medico": { "id": "42", "nombres": "Juan" },
  "paciente": { "id": "105", "nombres": "María" },
  "especialidad": { "id": "12", "nombre": "Cardiología" }
}
```

## Historias de usuario
1. **Creación de cita con especialidad y tipo**
   - Como personal administrativo, quiero seleccionar la especialidad y el tipo de cita para registrar una atención de forma correcta.
2. **Programación de estudios por especialidad**
   - Como personal administrativo, quiero seleccionar un servicio compatible con la especialidad elegida para asegurar que la agenda respete los tiempos reales de atención.
3. **Asignación de paciente**
   - Como personal administrativo, quiero asociar un paciente a una cita para mantener la trazabilidad de la atención.
4. **Reprogramación con cálculo automático**
   - Como médico o administrador, quiero reprogramar una cita solo con fecha de inicio para que el sistema calcule automáticamente la fecha fin.
5. **Listado con datos completos**
   - Como supervisor, quiero visualizar en el listado de citas los datos completos del médico y paciente en un formato uniforme.

## Criterios de aceptación
- **CA-01:** El sistema obliga a enviar `idServicio` y `tipoCita` al crear una cita.
- **CA-02:** `idEspecialidad` es opcional; si se envía, el backend valida que `idServicio` pertenezca a esa especialidad (N:N).
- **CA-03:** Para `tipoCita = CONSULTA`, el sistema calcula la fecha fin usando `CITA_CONSULTA_DURACION_MINUTOS`.
- **CA-04:** Para `tipoCita = ESTUDIO`, el sistema calcula la fecha fin usando la duración del servicio de tipo estudio.
- **CA-05:** En reprogramación, el usuario envía `fechaInicio`, `tipoCita` e `idServicio`; el sistema recalcula `fechaFin`.
- **CA-06:** El listado y la obtención de citas retornan datos completos de médico y paciente en el formato de `formatearPersonal`.
- **CA-07:** El sistema permite asociar opcionalmente una cita a un paciente mediante `idPaciente`.
