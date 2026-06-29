
-- ============== TEARDOWN OLD SCHEMA ==============
DROP VIEW IF EXISTS public.client_overview CASCADE;
DROP VIEW IF EXISTS public.revenue_by_tier CASCADE;
DROP VIEW IF EXISTS public.overdue_alerts CASCADE;

DROP TABLE IF EXISTS public.billing CASCADE;
DROP TABLE IF EXISTS public.agent_config CASCADE;
DROP TABLE IF EXISTS public.pipeline CASCADE;
DROP TABLE IF EXISTS public.users_profile CASCADE;
DROP TABLE IF EXISTS public.team_access CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS private.is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS private.is_team_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS private.can_view_billing(uuid) CASCADE;
DROP FUNCTION IF EXISTS private.current_client_id() CASCADE;
DROP SCHEMA IF EXISTS private CASCADE;

-- ============== HELPERS ==============
CREATE SCHEMA private;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============== ADMINS ==============
CREATE TABLE public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admins TO authenticated;
GRANT ALL ON public.admins TO service_role;

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.is_admin(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = _uid);
$$;
REVOKE EXECUTE ON FUNCTION private.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated, service_role;

CREATE POLICY "Admins can read admin list"
  ON public.admins FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));

-- ============== LEADS ==============
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  business_name text NOT NULL,
  email text,
  phone text NOT NULL,
  whatsapp text,
  industry text,
  city text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own lead"
  ON public.leads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own lead"
  ON public.leads FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));

CREATE POLICY "Users update own lead"
  ON public.leads FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR private.is_admin(auth.uid()));

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============== AUTO-CLAIM ADMIN ON SIGNUP ==============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.admins
     SET user_id = NEW.id
   WHERE user_id IS NULL
     AND lower(email) = lower(NEW.email);
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============== SEED ADMIN ==============
INSERT INTO public.admins (email, user_id)
SELECT 'ahmadsalem68t@gmail.com', id FROM auth.users WHERE lower(email)='ahmadsalem68t@gmail.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.admins (email)
VALUES ('ahmadsalem68t@gmail.com')
ON CONFLICT (email) DO NOTHING;
