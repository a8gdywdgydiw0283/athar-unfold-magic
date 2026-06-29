
-- =========================================================================
-- 1. Private schema for security helpers (not exposed via PostgREST)
-- =========================================================================
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

-- =========================================================================
-- 2. Tie team_access to auth.users by user_id (not email)
-- =========================================================================
ALTER TABLE public.team_access
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS team_access_user_id_key
  ON public.team_access(user_id) WHERE user_id IS NOT NULL;

-- Backfill existing rows from auth.users by email
UPDATE public.team_access ta
SET user_id = au.id
FROM auth.users au
WHERE ta.user_id IS NULL AND lower(au.email) = lower(ta.email);

-- =========================================================================
-- 3. Drop policies that depend on the old public helper functions
-- =========================================================================
DROP POLICY IF EXISTS "team can read clients" ON public.clients;
DROP POLICY IF EXISTS "team can insert clients" ON public.clients;
DROP POLICY IF EXISTS "team can update clients" ON public.clients;
DROP POLICY IF EXISTS "team can delete clients" ON public.clients;
DROP POLICY IF EXISTS "user reads own client" ON public.clients;

DROP POLICY IF EXISTS "team can read pipeline" ON public.pipeline;
DROP POLICY IF EXISTS "team can insert pipeline" ON public.pipeline;
DROP POLICY IF EXISTS "team can update pipeline" ON public.pipeline;
DROP POLICY IF EXISTS "team can delete pipeline" ON public.pipeline;
DROP POLICY IF EXISTS "user reads own pipeline" ON public.pipeline;

DROP POLICY IF EXISTS "team can read agent_config" ON public.agent_config;
DROP POLICY IF EXISTS "team can insert agent_config" ON public.agent_config;
DROP POLICY IF EXISTS "team can update agent_config" ON public.agent_config;
DROP POLICY IF EXISTS "team can delete agent_config" ON public.agent_config;
DROP POLICY IF EXISTS "user reads own agent_config" ON public.agent_config;

DROP POLICY IF EXISTS "billing-authorized team can read" ON public.billing;
DROP POLICY IF EXISTS "team can insert billing" ON public.billing;
DROP POLICY IF EXISTS "team can update billing" ON public.billing;
DROP POLICY IF EXISTS "team can delete billing" ON public.billing;
DROP POLICY IF EXISTS "user reads own billing" ON public.billing;

DROP POLICY IF EXISTS "team can read team_access" ON public.team_access;
DROP POLICY IF EXISTS "team can insert team_access" ON public.team_access;
DROP POLICY IF EXISTS "team can update team_access" ON public.team_access;
DROP POLICY IF EXISTS "team can delete team_access" ON public.team_access;

DROP POLICY IF EXISTS "admin manages all profiles" ON public.users_profile;
DROP POLICY IF EXISTS "users read own profile" ON public.users_profile;
DROP POLICY IF EXISTS "users insert own profile" ON public.users_profile;
DROP POLICY IF EXISTS "users update own profile" ON public.users_profile;

-- =========================================================================
-- 4. Drop the vulnerable public functions
-- =========================================================================
DROP FUNCTION IF EXISTS public.is_team_member();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.can_view_billing();
DROP FUNCTION IF EXISTS public.current_client_id();

-- =========================================================================
-- 5. Recreate helpers in private schema, using auth.uid()
-- =========================================================================
CREATE OR REPLACE FUNCTION private.is_team_member()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_access WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_access
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION private.can_view_billing()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_access
    WHERE user_id = auth.uid() AND can_view_billing = true
  );
$$;

CREATE OR REPLACE FUNCTION private.current_client_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT client_id FROM public.users_profile WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION private.is_team_member()    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin()          TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.can_view_billing()  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.current_client_id() TO anon, authenticated;

-- =========================================================================
-- 6. Update handle_new_user trigger to claim team_access rows by user_id
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_client_id uuid;
  is_admin_user boolean;
BEGIN
  -- If this email was pre-seeded on team_access, claim that row for this user.
  UPDATE public.team_access
     SET user_id = NEW.id
   WHERE user_id IS NULL
     AND lower(email) = lower(NEW.email);

  SELECT EXISTS (
    SELECT 1 FROM public.team_access
    WHERE user_id = NEW.id AND role = 'admin'
  ) INTO is_admin_user;

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

-- =========================================================================
-- 7. Recreate all policies using private.* helpers
-- =========================================================================
-- clients
CREATE POLICY "team can read clients"   ON public.clients FOR SELECT USING (private.is_team_member());
CREATE POLICY "team can insert clients" ON public.clients FOR INSERT WITH CHECK (private.is_team_member());
CREATE POLICY "team can update clients" ON public.clients FOR UPDATE USING (private.is_team_member()) WITH CHECK (private.is_team_member());
CREATE POLICY "team can delete clients" ON public.clients FOR DELETE USING (private.is_team_member());
CREATE POLICY "user reads own client"   ON public.clients FOR SELECT USING (id = private.current_client_id());

-- pipeline
CREATE POLICY "team can read pipeline"   ON public.pipeline FOR SELECT USING (private.is_team_member());
CREATE POLICY "team can insert pipeline" ON public.pipeline FOR INSERT WITH CHECK (private.is_team_member());
CREATE POLICY "team can update pipeline" ON public.pipeline FOR UPDATE USING (private.is_team_member()) WITH CHECK (private.is_team_member());
CREATE POLICY "team can delete pipeline" ON public.pipeline FOR DELETE USING (private.is_team_member());
CREATE POLICY "user reads own pipeline"  ON public.pipeline FOR SELECT USING (client_id = private.current_client_id());

-- agent_config
CREATE POLICY "team can read agent_config"   ON public.agent_config FOR SELECT USING (private.is_team_member());
CREATE POLICY "team can insert agent_config" ON public.agent_config FOR INSERT WITH CHECK (private.is_team_member());
CREATE POLICY "team can update agent_config" ON public.agent_config FOR UPDATE USING (private.is_team_member()) WITH CHECK (private.is_team_member());
CREATE POLICY "team can delete agent_config" ON public.agent_config FOR DELETE USING (private.is_team_member());
CREATE POLICY "user reads own agent_config"  ON public.agent_config FOR SELECT USING (client_id = private.current_client_id());

-- billing
CREATE POLICY "billing-authorized team can read" ON public.billing FOR SELECT USING (private.can_view_billing());
CREATE POLICY "team can insert billing"          ON public.billing FOR INSERT WITH CHECK (private.is_team_member());
CREATE POLICY "team can update billing"          ON public.billing FOR UPDATE USING (private.is_team_member()) WITH CHECK (private.is_team_member());
CREATE POLICY "team can delete billing"          ON public.billing FOR DELETE USING (private.is_team_member());
CREATE POLICY "user reads own billing"           ON public.billing FOR SELECT USING (client_id = private.current_client_id());

-- team_access
CREATE POLICY "team can read team_access"   ON public.team_access FOR SELECT USING (private.is_team_member());
CREATE POLICY "team can insert team_access" ON public.team_access FOR INSERT WITH CHECK (private.is_admin());
CREATE POLICY "team can update team_access" ON public.team_access FOR UPDATE USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "team can delete team_access" ON public.team_access FOR DELETE USING (private.is_admin());

-- users_profile
CREATE POLICY "admin manages all profiles" ON public.users_profile FOR ALL USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "users read own profile"     ON public.users_profile FOR SELECT USING (id = auth.uid() OR private.is_admin());
CREATE POLICY "users insert own profile"   ON public.users_profile FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users update own profile"   ON public.users_profile FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
