
-- 1. Admin helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_access
    WHERE lower(email) = lower(coalesce((auth.jwt() ->> 'email')::text, ''))
      AND role = 'admin'
  );
$$;

-- 2. users_profile table
CREATE TABLE public.users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  full_name TEXT,
  business_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  industry TEXT,
  city TEXT,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.users_profile TO authenticated;
GRANT ALL ON public.users_profile TO service_role;

ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own profile" ON public.users_profile
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "users update own profile" ON public.users_profile
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users insert own profile" ON public.users_profile
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "admin manages all profiles" ON public.users_profile
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON public.users_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. Helper: get the client_id linked to the current user
CREATE OR REPLACE FUNCTION public.current_client_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT client_id FROM public.users_profile WHERE id = auth.uid();
$$;

-- 4. Add user-scoped read policies on existing tables (admin policies stay via is_team_member)
CREATE POLICY "user reads own client" ON public.clients
  FOR SELECT TO authenticated
  USING (id = public.current_client_id());

CREATE POLICY "user reads own pipeline" ON public.pipeline
  FOR SELECT TO authenticated
  USING (client_id = public.current_client_id());

CREATE POLICY "user reads own billing" ON public.billing
  FOR SELECT TO authenticated
  USING (client_id = public.current_client_id());

CREATE POLICY "user reads own agent_config" ON public.agent_config
  FOR SELECT TO authenticated
  USING (client_id = public.current_client_id());

-- 5. Signup trigger: create client + pipeline + users_profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_client_id uuid;
  is_admin_user boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.team_access
    WHERE lower(email) = lower(NEW.email) AND role = 'admin'
  ) INTO is_admin_user;

  -- Admins: only create a minimal profile, no client/pipeline rows.
  IF is_admin_user THEN
    INSERT INTO public.users_profile (id, full_name, onboarded)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), true)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END IF;

  INSERT INTO public.clients (business_name, owner_name, email)
  VALUES ('New Client', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email)
  RETURNING id INTO new_client_id;

  INSERT INTO public.pipeline (client_id, status, source)
  VALUES (new_client_id, 'lead', 'website_form');

  INSERT INTO public.users_profile (id, client_id, full_name)
  VALUES (NEW.id, new_client_id, COALESCE(NEW.raw_user_meta_data->>'full_name', NULL))
  ON CONFLICT (id) DO UPDATE SET client_id = EXCLUDED.client_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Seed Ahmed as admin
INSERT INTO public.team_access (name, email, role, can_view_billing)
VALUES ('Ahmed', 'ahmadsalem68t@gmail.com', 'admin', true)
ON CONFLICT (email) DO UPDATE SET role = 'admin', can_view_billing = true;
