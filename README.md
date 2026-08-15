# PC BOX Sorteos

La web pública está construida con HTML, CSS y JavaScript vanilla.

## Ejecutar en Visual Studio

Desde esta carpeta:

```sh
pnpm install
pnpm run dev
```

Abre `http://127.0.0.1:8080/`. El entrypoint es `index.html`, la interfaz está en `styles.css` y la lógica en `app.js`.

El código anterior de TanStack/React se conserva dentro de `src/` como referencia, pero ya no es el entrypoint ni participa en el build de esta web vanilla.

## Supabase

El frontend usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`. La inscripción, consulta de tickets y suscripción de notificaciones pasan por `supabase/functions/public-api/index.ts`.

Despliega la función con:

```sh
supabase functions deploy public-api
```

Configura `SUPABASE_SERVICE_ROLE_KEY` únicamente en Supabase o en el entorno del servidor. Nunca uses esa clave con prefijo `VITE_` ni la pongas en `app.js`.

Aplica las migraciones de `supabase/migrations` para crear el bucket privado `comprobantes`, sus límites de archivo y la tabla de notificaciones.
