-- Cada unidad se registra como un premio individual para seleccionar un ganador por unidad.
BEGIN;

DO $$
DECLARE
  v_raffle uuid;
BEGIN
  SELECT id INTO v_raffle
  FROM public.raffles
  WHERE title = 'Primer Gran Sorteo'
  LIMIT 1;

  IF v_raffle IS NULL THEN
    RAISE EXCEPTION 'No se encontró el Primer Gran Sorteo';
  END IF;

  DELETE FROM public.prizes WHERE raffle_id = v_raffle;

  INSERT INTO public.prizes (raffle_id, position, name, image_url)
  SELECT v_raffle, item.position, item.name, item.image_url
  FROM (VALUES
    (1, 'Moto Pulsar N125', 'assets/premio-moto-pulsar-n125.png'),
    (2, 'Laptop Lenovo Core i5 (1 de 2)', 'assets/premio-laptop-lenovo.png'),
    (3, 'Laptop Lenovo Core i5 (2 de 2)', 'assets/premio-laptop-lenovo.png'),
    (4, 'Laptop Lenovo Core i3 (1 de 3)', 'assets/premio-laptop-lenovo.png'),
    (5, 'Laptop Lenovo Core i3 (2 de 3)', 'assets/premio-laptop-lenovo.png'),
    (6, 'Laptop Lenovo Core i3 (3 de 3)', 'assets/premio-laptop-lenovo.png'),
    (7, 'TV Smart LG de 65 pulgadas 4K (1 de 2)', 'assets/premio-tv-lg-65.png'),
    (8, 'TV Smart LG de 65 pulgadas 4K (2 de 2)', 'assets/premio-tv-lg-65.png'),
    (9, 'Fajo de S/ 300 (1 de 10)', 'assets/premio-fajos-300-soles.png'),
    (10, 'Fajo de S/ 300 (2 de 10)', 'assets/premio-fajos-300-soles.png'),
    (11, 'Fajo de S/ 300 (3 de 10)', 'assets/premio-fajos-300-soles.png'),
    (12, 'Fajo de S/ 300 (4 de 10)', 'assets/premio-fajos-300-soles.png'),
    (13, 'Fajo de S/ 300 (5 de 10)', 'assets/premio-fajos-300-soles.png'),
    (14, 'Fajo de S/ 300 (6 de 10)', 'assets/premio-fajos-300-soles.png'),
    (15, 'Fajo de S/ 300 (7 de 10)', 'assets/premio-fajos-300-soles.png'),
    (16, 'Fajo de S/ 300 (8 de 10)', 'assets/premio-fajos-300-soles.png'),
    (17, 'Fajo de S/ 300 (9 de 10)', 'assets/premio-fajos-300-soles.png'),
    (18, 'Fajo de S/ 300 (10 de 10)', 'assets/premio-fajos-300-soles.png')
  ) AS item(position, name, image_url);
END;
$$;

COMMIT;
