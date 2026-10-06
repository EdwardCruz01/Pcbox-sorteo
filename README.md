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

## Inscripción con carnet de extranjería

El registro permite DNI (consulta existente de identidad) o CE (nombres y apellidos declarados por el participante). El número se conserva como texto en `registrations.dni` por compatibilidad con el administrador; `document_type` distingue `DNI` y `CE`. Los registros anteriores conservan `DNI` por defecto. Los campos `first_names`, `paternal_surname` y `maternal_surname` guardan los datos del CE; el apellido materno es opcional y `full_name` se arma en el servidor.

Primero aplica únicamente `supabase/migrations/20261005120000_add_foreign_resident_registration.sql` en el proyecto existente, después despliega `public-api` junto con `functions/_shared`, y finalmente publica el frontend. No ejecutes indiscriminadamente las migraciones históricas: algunas reinician datos de eventos anteriores. La función pública debe conservar `verify_jwt = false` como en el despliegue existente.

El formulario acepta CE numérico de 8 a 12 dígitos y conserva los ceros iniciales. Los comprobantes CE se guardan bajo `CE-<numero>/`; los DNI mantienen su ruta existente. La consulta de inscripciones filtra por tipo y número para no mezclar identidades.

Pruebas del contrato de inscripción (sin pagos ni inscripciones reales):

```sh
node --experimental-vm-modules --test tests/registration-api.test.mjs
```
