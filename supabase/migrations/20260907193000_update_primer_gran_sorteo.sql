-- Reemplaza el sorteo PC BOX por el Primer Gran Sorteo de Pa Salado Mi Causa.
-- Se conserva el identificador del sorteo histórico para que no se pierdan sus referencias.
BEGIN;

DO $$
DECLARE
  v_raffle uuid;
BEGIN
  SELECT id INTO v_raffle
  FROM public.raffles
  WHERE title = '1° Gran Sorteo del Shucuy Regalon'
  LIMIT 1;

  IF v_raffle IS NULL THEN
    RAISE EXCEPTION 'No se encontró el sorteo que debe actualizarse';
  END IF;

  -- El sorteo PC BOX no tiene registros ni tickets; se retira de la página.
  DELETE FROM public.raffles
  WHERE title = 'Sorteo PC BOX - Próximamente';

  UPDATE public.raffles
  SET title = 'Primer Gran Sorteo',
      description = 'Participa por una moto, laptops Lenovo, televisores LG y fajos de dinero.',
      details = 'Sorteo con grandes premios. Cada ticket cuesta S/ 5. La inscripción se valida tras la aprobación del comprobante de Yape.',
      ticket_price = 5,
      draw_date = '2026-10-15T23:59:59-05:00',
      image_url = 'assets/banner-tarjeta-primer-gran-sorteo.jpeg',
      status = 'activo'
  WHERE id = v_raffle;

  DELETE FROM public.prizes WHERE raffle_id = v_raffle;

  INSERT INTO public.prizes (raffle_id, position, name, image_url)
  VALUES
    (v_raffle, 1, 'Moto Pulsar N125', 'assets/premio-moto-pulsar-n125.png'),
    (v_raffle, 2, '2 Laptops Lenovo Core i5', 'assets/premio-laptop-lenovo.png'),
    (v_raffle, 3, '3 Laptops Lenovo Core i3', 'assets/premio-laptop-lenovo.png'),
    (v_raffle, 4, '2 TV Smart LG de 65 pulgadas 4K', 'assets/premio-tv-lg-65.png'),
    (v_raffle, 5, '10 Fajos de S/ 300', 'assets/premio-fajos-300-soles.png');
END;
$$;

COMMIT;
