# Migración a `servicio_cita` en módulo de citas

## Resumen
Se unificó el manejo de **consultas** y **estudios** bajo un único concepto: `servicio_cita`.

- Antes: `tipoCita` + `idEstudio` (solo para ESTUDIO).
- Ahora: `tipoCita` + `idServicio` (para CONSULTA y ESTUDIO).
- `idEspecialidad` en creación/actualización de cita es **opcional**.

## Cambios de modelo

### Nueva entidad
- `servicio_cita`
  - `id`
  - `nombre`
  - `descripcion`
  - `tipo` (`CONSULTA` | `ESTUDIO`)
  - `duracionMinutos`
  - `costo`
  - `idEspecialidad` (opcional)

### Cita
- Reemplazo de campo relacional:
  - ❌ `idEstudio`
  - ✅ `idServicio`
- Relación de detalle de respuesta:
  - ❌ `estudio`
  - ✅ `servicio`

## APIs que deben actualizarse

## 1) REST `/citas` (POST)
Actualizar body de creación:

```json
{
  "detalle": "Control",
  "fechaInicio": "2026-02-21T10:00:00Z",
  "idMedico": "42",
  "idPaciente": "105",
  "idConsultorio": "8",
  "idEspecialidad": "12",
  "tipoCita": "CONSULTA",
  "idServicio": "5"
}
```

> `idEspecialidad` puede omitirse.

## 2) REST `/citas/:id` (PATCH)
Para cambiar tipo/servicio:

```json
{
  "tipoCita": "ESTUDIO",
  "idServicio": "15"
}
```

## 3) REST `/citas/:id/reprogramar` (PATCH)

```json
{
  "fechaInicio": "2026-02-28T16:00:00Z",
  "tipoCita": "ESTUDIO",
  "idServicio": "15"
}
```

## 4) Respuesta de cita
Campos de salida actualizados:
- `servicioId`
- `servicio` (objeto con nombre, tipo, duración, costo, estado)

## 5) Historial
El campo auditado para servicio cambia a:
- `idServicio`

## Sockets (si aplica)
Actualizar payloads de eventos:
- `citas:crear` → usar `idServicio`
- `citas:actualizar` → usar `idServicio`
- `citas:reprogramar` → usar `idServicio`

## Checklist de frontends/integraciones
- [ ] Reemplazar `idEstudio` por `idServicio` en formularios.
- [ ] Reemplazar `estudioId` por `servicioId` en modelos de vista.
- [ ] Leer `servicio` en vez de `estudio` en detalles/listados.
- [ ] Ajustar validaciones (ya no depende de ESTUDIO para enviar identificador).
