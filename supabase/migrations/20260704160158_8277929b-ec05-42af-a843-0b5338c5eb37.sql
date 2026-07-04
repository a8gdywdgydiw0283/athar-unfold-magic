
-- Deduplicate any existing rows on email first (keep the newest per email)
DELETE FROM public.consultation_requests c
USING public.consultation_requests c2
WHERE lower(c.email) = lower(c2.email)
  AND c.created_at < c2.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS consultation_requests_email_key
  ON public.consultation_requests (lower(email));

CREATE OR REPLACE FUNCTION public.submit_consultation(
  _name text,
  _email text,
  _whatsapp text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_name text := btrim(coalesce(_name, ''));
  v_email text := btrim(coalesce(_email, ''));
  v_whatsapp text := btrim(coalesce(_whatsapp, ''));
BEGIN
  IF length(v_name) < 1 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'invalid name';
  END IF;
  IF length(v_email) > 254 OR v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'invalid email';
  END IF;
  IF length(v_whatsapp) < 5 OR length(v_whatsapp) > 32 OR v_whatsapp !~ '^[+0-9\s()-]+$' THEN
    RAISE EXCEPTION 'invalid whatsapp';
  END IF;

  INSERT INTO public.consultation_requests (name, email, whatsapp)
  VALUES (v_name, v_email, v_whatsapp)
  ON CONFLICT (lower(email)) DO UPDATE
    SET name = EXCLUDED.name,
        whatsapp = EXCLUDED.whatsapp,
        created_at = now(),
        contacted = false,
        contacted_at = null,
        contacted_by = null
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_consultation(text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_consultation(text, text, text) TO anon, authenticated;
