# Comandos — Mediastream Live Monitor

## Iniciar el servidor

```bash
# Producción
node server.js

# Desarrollo (reinicia automáticamente al guardar cambios)
npm run dev
```

El dashboard queda disponible en: `http://localhost:3000`

---

## Generar access token para stream con Closed Access

Usado cuando un stream privado (ej. América TV) devuelve error 401 al leer el M3U8.
Requiere `AMERICATV_TOKEN_MS` en el `.env` (token especial para emisión, no el API token general).

```bash
node get-access-token-americatv.js <stream_id>
```

**Ejemplo:**
```bash
node get-access-token-americatv.js 69bae703d0d195b624e5315b
```

Imprime el token en consola. Pegarlo en el input **🔑 Access token** del slot correspondiente en el dashboard.

> Genera el token con `time_limit=3600` (válido 1 hora desde generación) y `validation_lock=3600` (token sigue válido durante 1 hora de uso continuo).
> El servidor genera estos tokens automáticamente — este script es para pruebas o casos puntuales.

---

## Debug — ver respuesta raw de la API para un stream

Útil para inspeccionar todos los campos que devuelve la API de un stream específico.

```bash
# Con el servidor corriendo, abrir en el browser:
http://localhost:3000/api/debug/<stream_id>
```

**Ejemplo:**
```
http://localhost:3000/api/debug/698a2b858ce046e68628214c
```

---

## Debug — ver contenido raw del M3U8

Muestra el playlist M3U8 completo (master + media playlist de mayor calidad). Útil para inspeccionar tags como `#EXT-X-PROGRAM-DATE-TIME`, `#EXT-X-MEDIA-SEQUENCE`, segmentos, etc.

```bash
http://localhost:3000/api/debug/m3u8/<stream_id>
```

**Ejemplo:**
```
http://localhost:3000/api/debug/m3u8/69bae703d0d195b624e5315b
```

> El stream debe estar monitoreado activamente para que use el access token guardado. Si no está en un slot, se intenta sin token.
