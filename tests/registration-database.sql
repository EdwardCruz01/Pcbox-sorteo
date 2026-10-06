-- Isolated fixtures only. ROLLBACK ensures no event, registration or ticket persists.
BEGIN;
DO $$
DECLARE
  event_id uuid;
  ce_id uuid;
  dni_id uuid;
  admin_id uuid;
  assigned integer[];
BEGIN
  SELECT user_id INTO admin_id FROM public.user_roles WHERE role = 'admin' LIMIT 1;
  IF admin_id IS NULL THEN RAISE EXCEPTION 'An admin role is required to test approval'; END IF;
  PERFORM set_config('request.jwt.claim.sub', admin_id::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);

  INSERT INTO public.raffles(title, status, ticket_price)
    VALUES ('CE transactional verification - rolled back', 'inactivo', 5) RETURNING id INTO event_id;
  INSERT INTO public.registrations(raffle_id, document_type, dni, first_names, paternal_surname, full_name, phone, quantity, amount)
    VALUES(event_id, 'CE', '00123456', 'Ana María', 'De la Cruz', 'Ana María De la Cruz', '912345678', 2, 10)
    RETURNING id INTO ce_id;
  INSERT INTO public.registrations(raffle_id, dni, full_name, quantity, amount)
    VALUES(event_id, '00123456', 'DNI regression fixture', 1, 5) RETURNING id INTO dni_id;

  IF (SELECT document_type FROM public.registrations WHERE id = dni_id) <> 'DNI' THEN
    RAISE EXCEPTION 'Legacy DNI default was not preserved';
  END IF;
  IF (SELECT count(*) FROM public.registrations WHERE raffle_id = event_id AND document_type = 'CE' AND dni = '00123456') <> 1 THEN
    RAISE EXCEPTION 'Document type isolation failed';
  END IF;
  IF (SELECT maternal_surname FROM public.registrations WHERE id = ce_id) IS NOT NULL THEN
    RAISE EXCEPTION 'Optional surname was not preserved';
  END IF;

  BEGIN
    INSERT INTO public.registrations(raffle_id, document_type, dni, full_name)
      VALUES(event_id, 'CE', '001234567', 'Incomplete identity');
    RAISE EXCEPTION 'Missing CE identity fields were accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  SELECT numbers INTO assigned FROM public.aprobar_inscripcion(ce_id);
  IF assigned IS DISTINCT FROM ARRAY[100,101] THEN RAISE EXCEPTION 'CE ticket allocation failed'; END IF;
  SELECT numbers INTO assigned FROM public.aprobar_inscripcion(dni_id);
  IF assigned IS DISTINCT FROM ARRAY[102] THEN RAISE EXCEPTION 'DNI ticket allocation failed'; END IF;
  PERFORM * FROM public.aprobar_inscripcion(ce_id);
  IF (SELECT count(*) FROM public.tickets WHERE registration_id = ce_id) <> 2 THEN
    RAISE EXCEPTION 'Repeated approval duplicated CE tickets';
  END IF;
  IF (SELECT status FROM public.registrations WHERE id = ce_id) <> 'aprobado' THEN
    RAISE EXCEPTION 'CE approval status was not saved';
  END IF;
END;
$$;
ROLLBACK;
SELECT 'PASS: CE/DNI identity, constraints and existing ticket approval; all fixtures rolled back' AS result;
