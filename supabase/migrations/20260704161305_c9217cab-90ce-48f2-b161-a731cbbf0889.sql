
-- 1. Private schema (not exposed to PostgREST)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM public, anon, authenticated;
GRANT USAGE ON SCHEMA private TO anon, authenticated;

-- 2. Move has_role → private.has_role
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO anon, authenticated;

-- 3. Repoint RLS policies to private.has_role
DROP POLICY IF EXISTS "Admins read consultations" ON public.consultation_requests;
CREATE POLICY "Admins read consultations"
  ON public.consultation_requests FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update consultations" ON public.consultation_requests;
CREATE POLICY "Admins update consultations"
  ON public.consultation_requests FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users read own onboarding" ON public.onboarding_submissions;
CREATE POLICY "Users read own onboarding"
  ON public.onboarding_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update onboarding" ON public.onboarding_submissions;
CREATE POLICY "Admins update onboarding"
  ON public.onboarding_submissions FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users read own lead" ON public.leads;
CREATE POLICY "Users read own lead"
  ON public.leads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users update own lead" ON public.leads;
CREATE POLICY "Users update own lead"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));

-- 4. Drop the old public.has_role
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 5. Move submit_consultation → private
CREATE OR REPLACE FUNCTION private.submit_consultation(
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
REVOKE ALL ON FUNCTION private.submit_consultation(text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION private.submit_consultation(text, text, text) TO anon, authenticated;

-- 6. Drop old public.submit_consultation
DROP FUNCTION IF EXISTS public.submit_consultation(text, text, text);

-- 7. Public SECURITY INVOKER wrapper so anon can still book via PostgREST RPC
CREATE OR REPLACE FUNCTION public.submit_consultation(
  _name text,
  _email text,
  _whatsapp text
) RETURNS uuid
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, private
AS $$
  SELECT private.submit_consultation(_name, _email, _whatsapp);
$$;
REVOKE ALL ON FUNCTION public.submit_consultation(text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_consultation(text, text, text) TO anon, authenticated;

-- 8. Explicit deny-DELETE policy on consultation_requests (RLS default is already deny;
--    this makes the intent explicit).
DROP POLICY IF EXISTS "No deletes on consultations" ON public.consultation_requests;
CREATE POLICY "No deletes on consultations"
  ON public.consultation_requests FOR DELETE
  TO anon, authenticated
  USING (false);
