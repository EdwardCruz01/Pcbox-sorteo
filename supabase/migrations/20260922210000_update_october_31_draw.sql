-- Fecha del Primer Gran Sorteo: 31 de octubre de 2026 a las 9:00 p. m.
BEGIN;

UPDATE public.raffles
SET draw_date = '2026-10-31T21:00:00-05:00',
    image_url = 'assets/banner-tarjeta-primer-gran-sorteo.jpeg'
WHERE title = 'Primer Gran Sorteo';

COMMIT;
