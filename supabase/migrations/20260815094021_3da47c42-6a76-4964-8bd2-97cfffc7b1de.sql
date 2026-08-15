CREATE OR REPLACE FUNCTION public.aprobar_inscripcion(p_registration_id uuid, p_nota text DEFAULT NULL)
RETURNS TABLE (registration_id uuid, numbers int[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reg public.registrations%ROWTYPE;
  v_next int;
  v_nums int[];
  i int;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT * INTO v_reg FROM public.registrations WHERE id = p_registration_id FOR UPDATE;
  IF v_reg.id IS NULL THEN
    RAISE EXCEPTION 'La inscripción no existe';
  END IF;

  IF EXISTS (SELECT 1 FROM public.tickets t WHERE t.registration_id = p_registration_id) THEN
    RETURN QUERY
      SELECT p_registration_id, array_agg(t.number ORDER BY t.number)
      FROM public.tickets t WHERE t.registration_id = p_registration_id;
    RETURN;
  END IF;

  SELECT COALESCE(MAX(t.number) + 1, 100) INTO v_next
  FROM public.tickets t WHERE t.raffle_id = v_reg.raffle_id;

  v_nums := ARRAY[]::int[];
  FOR i IN 0 .. (v_reg.quantity - 1) LOOP
    INSERT INTO public.tickets (raffle_id, registration_id, number)
    VALUES (v_reg.raffle_id, v_reg.id, v_next + i);
    v_nums := array_append(v_nums, v_next + i);
  END LOOP;

  UPDATE public.registrations
     SET status = 'aprobado',
         admin_note = COALESCE(p_nota, admin_note),
         reviewed_at = now()
   WHERE id = p_registration_id;

  RETURN QUERY SELECT p_registration_id, v_nums;
END;
$$;

CREATE OR REPLACE FUNCTION public.rechazar_inscripcion(p_registration_id uuid, p_nota text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  UPDATE public.registrations
     SET status = 'rechazado',
         admin_note = COALESCE(p_nota, admin_note),
         reviewed_at = now()
   WHERE id = p_registration_id;
END;
$$;

REVOKE ALL ON FUNCTION public.aprobar_inscripcion(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rechazar_inscripcion(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aprobar_inscripcion(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rechazar_inscripcion(uuid, text) TO authenticated, service_role;