# Implementación mobile: control de actualización por `GET /api/estado`

Este documento describe cómo debe implementar la app mobile el control de actualización remota usando el endpoint:

- `GET /api/estado`

El objetivo es que la aplicación pueda:

1. detectar si la actualización es **obligatoria**;
2. detectar si la actualización es solo **recomendada**;
3. continuar normalmente cuando la versión instalada sea **compatible**.

---

## 1. Resumen funcional

La app mobile debe consultar `GET /api/estado` enviando:

- `platform`: `android` o `ios`
- `version`: versión semántica de la app (`major.minor.patch`)
- `build`: número de compilación opcional

Ejemplo:

```http
GET /api/estado?platform=android&version=1.8.5&build=105
```

El backend responderá el bloque `mobile` dentro de `datos` con la política resuelta para esa versión.

---

## 2. Variables de entorno que gobiernan la política

El backend resuelve la política por plataforma usando estas variables:

### Android

- `MOBILE_ANDROID_MIN_VERSION`
- `MOBILE_ANDROID_STABLE_VERSION`
- `MOBILE_ANDROID_STORE_URL`

### iOS

- `MOBILE_IOS_MIN_VERSION`
- `MOBILE_IOS_STABLE_VERSION`
- `MOBILE_IOS_STORE_URL`

Si faltan `MIN_VERSION` o `STABLE_VERSION`, el backend responderá `mobile.enabled = false`.

---

## 3. Request que debe enviar la app

## 3.1 Endpoint

```http
GET /api/estado
```

## 3.2 Query params

| Campo      | Tipo   | Requerido | Descripción |
| ---------- | ------ | --------- | ----------- |
| `platform` | string | Sí        | `android` o `ios` |
| `version`  | string | Sí        | versión en formato `major.minor.patch` |
| `build`    | string | No        | número de build o versión interna |

## 3.3 Ejemplos

### Android

```http
GET /api/estado?platform=android&version=1.7.0&build=100
```

### iOS

```http
GET /api/estado?platform=ios&version=1.8.2&build=88
```

---

## 4. Response que debe consumir mobile

## 4.1 Respuesta base

La estructura relevante es:

```json
{
  "finalizado": true,
  "mensaje": "¡Tarea completada con éxito!",
  "datos": {
    "servicio": "redneuro-backend",
    "version": "1.12.0",
    "entorno": "production",
    "estado": "Servicio funcionando correctamente",
    "commit_sha": "abc123",
    "mensaje": "feat: mobile version policy",
    "branch": "main",
    "fecha": "2026-03-23 12:30:45.000",
    "hora": 1774269045000,
    "mobile": {
      "enabled": true,
      "platform": "android",
      "currentVersion": "1.7.0",
      "currentBuild": "100",
      "minVersion": "1.8.0",
      "stableVersion": "1.9.3",
      "status": "required",
      "forceUpdate": true,
      "shouldUpdate": true,
      "storeUrl": "https://play.google.com/store/apps/details?id=bo.redneuro.app",
      "title": "Actualización requerida",
      "message": "Debes actualizar la aplicación para continuar usando el servicio."
    }
  }
}
```

## 4.2 Campos del bloque `mobile`

| Campo | Tipo | Significado |
| --- | --- | --- |
| `enabled` | boolean | indica si el backend pudo evaluar la política |
| `platform` | string \| null | plataforma evaluada |
| `currentVersion` | string \| null | versión enviada por la app |
| `currentBuild` | string \| null | build enviado por la app |
| `minVersion` | string \| null | mínima versión permitida |
| `stableVersion` | string \| null | versión estable recomendada |
| `status` | `required` \| `recommended` \| `ok` \| null | resultado final |
| `forceUpdate` | boolean \| null | si debe bloquearse la app |
| `shouldUpdate` | boolean \| null | si debe mostrarse sugerencia de actualización |
| `storeUrl` | string \| null | URL de tienda |
| `title` | string \| null | título sugerido para modal/pantalla |
| `message` | string \| null | mensaje sugerido para UI |

---

## 5. Reglas de decisión que debe respetar mobile

La app **no debe recalcular la política**. Debe confiar en lo que responda backend.

## 5.1 `status = required`

Significa:

- la versión instalada es menor a la mínima soportada;
- la actualización es obligatoria;
- la app debe bloquear el acceso funcional.

### Comportamiento recomendado

- mostrar pantalla bloqueante;
- no permitir entrar al home;
- mostrar botón `Actualizar`;
- abrir `storeUrl`;
- no mostrar botón `Omitir`.

## 5.2 `status = recommended`

Significa:

- la versión actual todavía funciona;
- existe una versión estable más nueva;
- la actualización no es obligatoria.

### Comportamiento recomendado

- mostrar modal o banner;
- permitir continuar usando la app;
- ofrecer `Actualizar ahora` y `Más tarde`.

## 5.3 `status = ok`

Significa:

- la versión instalada es compatible;
- no se requiere acción de actualización.

### Comportamiento recomendado

- continuar flujo normal;
- no mostrar modal bloqueante;
- opcionalmente no mostrar ningún aviso.

---

## 6. Cuándo debe consultar la app

La app debe consultar `GET /api/estado` en estos momentos:

1. al iniciar la aplicación;
2. al volver de background a foreground;
3. opcionalmente después del login o refresh de sesión.

## 6.1 Recomendación de throttling

Para evitar llamadas excesivas, se recomienda:

- consultar siempre en arranque en frío;
- en foreground, no repetir si ya se consultó hace menos de `3` a `5` minutos.

---

## 7. Flujo recomendado en mobile

## 7.1 Secuencia

1. leer versión instalada de la app;
2. detectar plataforma (`android` / `ios`);
3. invocar `GET /api/estado` con `platform`, `version` y `build`;
4. revisar `response.datos.mobile`;
5. actuar según `status`.

## 7.2 Pseudocódigo

```ts
async function checkRemoteVersionPolicy() {
  const platform = getPlatform()
  const version = getAppVersion()
  const build = getBuildNumber()

  const response = await api.get('/estado', {
    params: { platform, version, build },
  })

  const mobile = response.data?.datos?.mobile

  if (!mobile || mobile.enabled !== true) {
    return { type: 'skip' }
  }

  if (mobile.status === 'required') {
    return {
      type: 'force-update',
      title: mobile.title,
      message: mobile.message,
      storeUrl: mobile.storeUrl,
    }
  }

  if (mobile.status === 'recommended') {
    return {
      type: 'recommended-update',
      title: mobile.title,
      message: mobile.message,
      storeUrl: mobile.storeUrl,
    }
  }

  return { type: 'ok' }
}
```

---

## 8. Ejemplos de comportamiento esperado

## 8.1 Caso A: actualización obligatoria

### Request

```http
GET /api/estado?platform=android&version=1.7.0&build=100
```

### Resultado esperado

- `mobile.enabled = true`
- `mobile.status = required`
- `mobile.forceUpdate = true`
- bloquear navegación

## 8.2 Caso B: actualización recomendada

### Request

```http
GET /api/estado?platform=android&version=1.8.5&build=105
```

### Resultado esperado

- `mobile.enabled = true`
- `mobile.status = recommended`
- `mobile.forceUpdate = false`
- permitir continuar

## 8.3 Caso C: versión válida

### Request

```http
GET /api/estado?platform=ios&version=1.8.2&build=88
```

### Resultado esperado

- `mobile.enabled = true`
- `mobile.status = ok`
- `mobile.shouldUpdate = false`

---

## 9. Manejo de errores y fallback

## 9.1 Si falla la llamada al backend

Recomendación:

- no bloquear por defecto;
- registrar error local;
- reintentar más adelante;
- permitir continuar salvo que el producto defina otra política.

## 9.2 Si `mobile` viene en `null`

Interpretar como:

- backend consultado sin evaluación mobile;
- continuar sin validación remota.

## 9.3 Si `mobile.enabled = false`

Interpretar como:

- backend no tiene política activa o completa para esa plataforma;
- continuar sin bloqueo.

---

## 10. Recomendaciones de UI/UX

## 10.1 Pantalla de actualización obligatoria

Debe incluir:

- logo o branding;
- `title`;
- `message`;
- botón `Actualizar`;
- apertura directa de `storeUrl`.

## 10.2 Modal de actualización recomendada

Debe incluir:

- `title`;
- `message`;
- botón `Actualizar ahora`;
- botón `Más tarde`.

## 10.3 Persistencia local sugerida

Se recomienda guardar:

- fecha/hora del último chequeo;
- último `status` recibido;
- última versión consultada.

Esto ayuda a evitar:

- mostrar el mismo modal demasiadas veces;
- repetir validaciones innecesarias.

---

## 11. Checklist de implementación mobile

- [ ] obtener `platform`, `version` y `build` desde la app instalada;
- [ ] invocar `GET /api/estado` con query params;
- [ ] mapear `response.data.datos.mobile`;
- [ ] implementar pantalla bloqueante para `required`;
- [ ] implementar modal/banner para `recommended`;
- [ ] no mostrar advertencia cuando `status = ok`;
- [ ] agregar throttling para foreground;
- [ ] abrir `storeUrl` con deep link externo;
- [ ] registrar logs o analytics del resultado recibido.

---

## 12. Contrato operativo recomendado entre backend y mobile

Para evitar inconsistencias:

- backend decide la política;
- mobile solo interpreta el resultado;
- mobile no debe mantener reglas paralelas de comparación de versiones;
- el formato de `version` debe mantenerse siempre como `major.minor.patch`.

---

## 13. Ejemplo de integración rápida en mobile

## 13.1 Hook o servicio central

Crear un servicio único, por ejemplo:

- `RemoteVersionPolicyService`

Responsabilidades:

- consultar `/api/estado`;
- cachear resultado reciente;
- exponer:
  - `checkNow()`
  - `shouldBlock()`
  - `shouldShowRecommendedModal()`

## 13.2 Integración con ciclo de vida

Invocar ese servicio:

- en splash;
- en `onResume` / `AppState.active`;
- después de login si se reconstruye sesión.

---

## 14. Conclusión

La implementación mobile debe tratar este mecanismo como una **política remota de compatibilidad** servida por backend.

La decisión final siempre está en:

- `datos.mobile.status`
- `datos.mobile.forceUpdate`
- `datos.mobile.shouldUpdate`

Con esto la app podrá responder correctamente a cambios de versión mínima o estable sin hardcodear reglas en el cliente.
