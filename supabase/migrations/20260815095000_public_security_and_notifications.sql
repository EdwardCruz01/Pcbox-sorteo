-- Seguridad del flujo público de comprobantes y suscriptores de notificaciones.
-- La clave service_role solo se usa en el servidor; nunca se envía al navegador.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comprobantes',
  'comprobantes',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "comprobantes upload" ON storage.objects;
CREATE POLICY "comprobantes upload"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'comprobantes'
  AND name ~ '^\d{8}/[a-fA-F0-9-]{8,64}\.(jpg|jpeg|png|webp|heic|pdf)$'
  AND COALESCE((metadata->>'mimetype') IN ('image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'), false)
);

DROP POLICY IF EXISTS "comprobantes admin read" ON storage.objects;
CREATE POLICY "comprobantes admin read"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'comprobantes' AND public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.notification_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text,
  phone text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_subscribers_contact_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS notification_subscribers_email_uidx
  ON public.notification_subscribers (lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS notification_subscribers_phone_uidx
  ON public.notification_subscribers (phone) WHERE phone IS NOT NULL;

REVOKE ALL ON public.notification_subscribers FROM anon, authenticated;
GRANT ALL ON public.notification_subscribers TO service_role;
ALTER TABLE public.notification_subscribers ENABLE ROW LEVEL SECURITY;

-- Evita que dos aprobaciones concurrentes calculen el mismo siguiente ticket.
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
  IF v_reg.id IS NULL THEN RAISE EXCEPTION 'La inscripción no existe'; END IF;
  IF v_reg.status = 'rechazado' THEN RAISE EXCEPTION 'No se puede aprobar una inscripción rechazada'; END IF;

  IF EXISTS (SELECT 1 FROM public.tickets t WHERE t.registration_id = p_registration_id) THEN
    RETURN QUERY SELECT p_registration_id, array_agg(t.number ORDER BY t.number)
      FROM public.tickets t WHERE t.registration_id = p_registration_id;
    RETURN;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_reg.raffle_id::text, 0));
  SELECT COALESCE(MAX(t.number) + 1, 100) INTO v_next FROM public.tickets t WHERE t.raffle_id = v_reg.raffle_id;
  v_nums := ARRAY[]::int[];
  FOR i IN 0 .. (v_reg.quantity - 1) LOOP
    INSERT INTO public.tickets (raffle_id, registration_id, number)
    VALUES (v_reg.raffle_id, v_reg.id, v_next + i);
    v_nums := array_append(v_nums, v_next + i);
  END LOOP;

  UPDATE public.registrations SET status = 'aprobado', admin_note = COALESCE(p_nota, admin_note), reviewed_at = now()
  WHERE id = p_registration_id;
  RETURN QUERY SELECT p_registration_id, v_nums;
END;
$$;

REVOKE ALL ON FUNCTION public.aprobar_inscripcion(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.aprobar_inscripcion(uuid, text) TO service_role;
