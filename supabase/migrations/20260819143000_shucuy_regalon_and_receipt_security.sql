-- El Shucuy Regalon: actualización del sorteo, consentimiento y comprobantes privados.
-- Ejecutar después del esquema principal y de las migraciones base.

BEGIN;

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS terms_accepted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comprobantes',
  'comprobantes',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Las subidas públicas directas quedan deshabilitadas. La web usa URLs firmadas
-- emitidas por la Edge Function después de validar el DNI y el formato.
DROP POLICY IF EXISTS "comprobantes upload" ON storage.objects;

UPDATE public.raffles
SET title = '1° Gran Sorteo del Shucuy Regalon',
    description = 'El próximo PC profesional puede ser tuyo junto a cinco premios tecnológicos.',
    details = 'Sorteo con 6 premios. Cada ticket cuesta S/ 5. La inscripción se valida tras la aprobación del comprobante de Yape.',
    draw_date = '2026-09-23 23:59:59-05:00'
WHERE status = 'activo';

UPDATE public.prizes p
SET name = CASE p.position
      WHEN 1 THEN 'PC Gamer profesional + silla gaming + mesa elevable'
      WHEN 2 THEN 'Impresora Epson L3310'
      WHEN 3 THEN 'Tablet Samsung Tab A11'
      WHEN 4 THEN 'Audífono profesional Logitech G635'
      WHEN 5 THEN 'Teclado gamer mecánico Antryx Zigra Evo'
      WHEN 6 THEN 'Parlante Halion Fiesta HA-R63'
      ELSE p.name
    END,
    image_url = CASE p.position
      WHEN 1 THEN 'assets/hero-sorteo.jpg'
      WHEN 2 THEN 'assets/premio-impresora-epson-l3310.png'
      WHEN 3 THEN 'assets/premio-tablet-samsung-tab-a11.png'
      WHEN 4 THEN 'assets/premio-audifono-logitech-g635.png'
      WHEN 5 THEN 'assets/premio-teclado-antryx-zigra-evo.png'
      WHEN 6 THEN 'assets/premio-parlante-hal-fiesta-ha-r63.png'
      ELSE p.image_url
    END
FROM public.raffles r
WHERE p.raffle_id = r.id
  AND r.status = 'activo'
  AND p.position BETWEEN 1 AND 6;

INSERT INTO public.prizes (raffle_id, position, name, image_url)
SELECT r.id, 6, 'Parlante Halion Fiesta HA-R63', 'assets/premio-parlante-hal-fiesta-ha-r63.png'
FROM public.raffles r
WHERE r.status = 'activo'
  AND NOT EXISTS (
    SELECT 1 FROM public.prizes p WHERE p.raffle_id = r.id AND p.position = 6
  );

COMMIT;
