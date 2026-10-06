-- Add CE without renaming the legacy document column used by the admin and tickets.
-- Existing registrations and older DNI clients retain the DNI default.
BEGIN;

ALTER TABLE public.registrations
  ADD COLUMN document_type text NOT NULL DEFAULT 'DNI',
  ADD COLUMN first_names text,
  ADD COLUMN paternal_surname text,
  ADD COLUMN maternal_surname text;

ALTER TABLE public.registrations
  ADD CONSTRAINT registrations_document_type_check
    CHECK (document_type IN ('DNI', 'CE')),
  ADD CONSTRAINT registrations_ce_identity_check CHECK (
    document_type <> 'CE' OR (
      dni ~ '^[0-9]{8,12}$'
      AND first_names IS NOT NULL AND length(btrim(first_names)) BETWEEN 1 AND 80
      AND paternal_surname IS NOT NULL AND length(btrim(paternal_surname)) BETWEEN 1 AND 80
      AND (maternal_surname IS NULL OR length(btrim(maternal_surname)) BETWEEN 1 AND 80)
    )
  );

CREATE INDEX registrations_document_identity_idx
  ON public.registrations (document_type, dni);

COMMENT ON COLUMN public.registrations.dni IS
  'Document number stored as text (including leading zeros); interpret with document_type.';
COMMENT ON COLUMN public.registrations.document_type IS
  'DNI uses the existing identity lookup. CE names are declared by the participant.';

NOTIFY pgrst, 'reload schema';
COMMIT;
