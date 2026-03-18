# Guía para app móvil (explicada simple)

## ¿Qué debe notar el usuario en la app?
Cuando una cita se reprograma, ya no verá historiales separados.
Verá **un solo historial** con un mensaje claro de reprogramación:
- cuándo era antes,
- y cuándo quedó ahora.

## Ejemplo real esperado en UI
"Cita reprogramada: antes 10/02/2026 09:00 - 10/02/2026 09:30, ahora 12/02/2026 11:00 - 12/02/2026 11:30"

Esto evita confusión y explica el cambio en lenguaje entendible.

---

## Qué cambia para desarrollo mobile
El endpoint sigue siendo:
- `GET /citas/:id/historial`

Pero ahora cada ítem puede traer:
- `historialCitaId` (opcional, para agrupar toda la cadena).

## Recomendación de modelo
Agregar campo opcional:
- `historialCitaId?: string`

Conservar:
- `citaId`,
- `comentario`,
- `detalleCambios`,
- `fechaCreacion`.

## Recomendación de cache
Usar clave:
- `historial:${historialCitaId ?? citaId}`

Así, si abren historial desde la cita original o la reprogramada, la app reutiliza la misma cadena.

## UX recomendada
- Título: **Historial de la cita**.
- Mostrar comentario de reprogramación en texto humano (antes/ahora).
- Mantener orden por fecha descendente (como viene del backend).

---

## Compatibilidad
Si llega un registro antiguo sin `historialCitaId`, la app debe seguir funcionando normal.
No bloquear pantalla por ausencia de ese campo.

---

## Checklist QA (no técnico)
1. Crear una cita y abrir historial.
2. Reprogramar la cita.
3. Abrir historial desde la cita antigua.
4. Abrir historial desde la cita nueva.
5. Confirmar que en ambos casos se ve lo mismo y aparece un único evento claro de reprogramación.
