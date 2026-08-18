-- Fecha pública del sorteo activo: 23 de septiembre de 2026.
UPDATE public.raffles
SET draw_date = '2026-09-23 23:59:59-05:00'
WHERE status = 'activo';
