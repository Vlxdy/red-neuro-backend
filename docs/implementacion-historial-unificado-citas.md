# Qué se cambió realmente (explicado en lenguaje simple)

Este cambio busca que el historial de citas sea **uno solo**, incluso cuando la cita fue reprogramada.

## ¿Qué problema tenía el usuario?
Antes, cuando se reprogramaba una cita, se creaba una nueva cita y el historial quedaba “partido” en dos lugares.

En la práctica, eso se sentía así:
- en una pantalla veías una parte del historial,
- en otra cita veías otra parte,
- y era difícil entender la historia completa.

## ¿Qué ve ahora un usuario normal?
Ahora el usuario verá **un solo historial continuo** para esa cadena de citas.

Si la cita se reprogramó, el historial mostrará claramente algo como:
- **“Cita reprogramada: antes 10/02/2026 09:00 - 10/02/2026 09:30, ahora 12/02/2026 11:00 - 12/02/2026 11:30”**.

Es decir: se ve explícitamente **cuándo era antes** y **cuándo quedó ahora**.

---

# Qué se modificó exactamente en backend

## 1) Al reprogramar, ahora se registra **un solo evento de historial**
Antes se podían generar dos eventos (uno por la nueva cita y otro por la reprogramación).
Ahora, para que sea claro para el usuario, se deja **un único evento explícito de reprogramación** con rango anterior y nuevo.

## 2) Todas las citas relacionadas comparten una misma “cadena”
Se usa un identificador común (`idHistorialCita`) para unir:
- cita original,
- cita reprogramada,
- y futuras reprogramaciones.

Así, entrar al historial desde cualquiera de esas citas devuelve la misma historia.

## 3) Historial unificado con compatibilidad
- Si la cita ya tiene `idHistorialCita`, se usa ese valor para traer todo el historial unificado.
- Si es un dato antiguo sin ese campo, el sistema sigue funcionando con el modo anterior (fallback).

## 4) Se expone el identificador de cadena en la respuesta
La respuesta del historial ahora también incluye `historialCitaId` para que frontend/mobile pueda cachear y agrupar mejor.

---

# Cambios técnicos aplicados (resumen)
- Se agregó `idHistorialCita` en `historial_citas` (entidad).
- El repositorio de historial completa automáticamente ese valor cuando escribe eventos.
- La consulta de historial prioriza cadena unificada por `idHistorialCita`.
- Se forzó propagación de `idHistorialCita` en reprogramación.
- Se cambió la reprogramación para dejar un solo historial explícito (antes/ahora).

---

# Qué falta aplicar en base de datos (si corresponde)
Si tu entorno no genera esquema automáticamente, aplicar:

```sql
ALTER TABLE historial_citas
ADD COLUMN IF NOT EXISTS id_historial_cita varchar(100);

CREATE INDEX IF NOT EXISTS idx_historial_citas_historial_fecha
ON historial_citas (id_historial_cita, fecha_creacion DESC, id DESC);
```

Backfill recomendado:

```sql
UPDATE historial_citas hc
SET id_historial_cita = c.id_historial_cita
FROM citas c
WHERE hc.id_cita = c.id
  AND hc.id_historial_cita IS NULL
  AND c.id_historial_cita IS NOT NULL;
```
