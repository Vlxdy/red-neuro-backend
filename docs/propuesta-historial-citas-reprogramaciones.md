# Propuesta funcional (versión humana): historial único para citas reprogramadas

## En una frase
Si una cita se reprograma, el usuario debe ver **una sola historia** de esa cita, no dos historiales separados.

## Qué pasaba antes
- Se creaba una nueva cita al reprogramar.
- El historial quedaba dividido entre la cita antigua y la nueva.
- El usuario tenía que “armar mentalmente” la historia completa.

## Qué debe pasar ahora
- Todas las citas que vienen de la misma reprogramación comparten un mismo historial.
- En reprogramación se registra un evento claro y explícito:
  - **antes** (fecha/hora original),
  - **ahora** (fecha/hora nueva).
- Desde cualquier cita de la cadena se ve el mismo historial.

---

## Cambios exactos planteados
1. Usar `idHistorialCita` como identificador común de cadena.
2. Guardar ese identificador también en los eventos de historial.
3. Consultar historial por ese identificador común.
4. Mantener fallback para datos antiguos.
5. En reprogramación, registrar un único evento legible para usuario final.

---

## Cómo lo entiende un usuario no técnico
Cuando abre su historial verá mensajes directos y comprensibles, por ejemplo:

> "Cita reprogramada: antes 10/02/2026 09:00 - 10/02/2026 09:30, ahora 12/02/2026 11:00 - 12/02/2026 11:30"

Eso le confirma exactamente qué cambió, sin tener que revisar dos citas distintas.

---

## Criterios de aceptación
- Reprogramar una cita no crea confusión de historial.
- Desde cita original y cita nueva se ve la misma línea de tiempo.
- El evento de reprogramación indica explícitamente antes/ahora.
- Datos antiguos siguen visibles sin romper funcionamiento.
