
-- ============ TABLES ============

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT UNIQUE,
  industry TEXT,
  city TEXT,
  tier TEXT CHECK (tier IN ('CORE','FLOW','ELITE')) DEFAULT 'FLOW',
  language TEXT CHECK (language IN ('ar','en','both')) DEFAULT 'both',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('lead','demo_booked','contract_signed','onboarding','live','churned')) DEFAULT 'lead',
  source TEXT DEFAULT 'website_form',
  demo_booked_at TIMESTAMPTZ,
  contract_signed_at TIMESTAMPTZ,
  onboarding_started_at TIMESTAMPTZ,
  went_live_at TIMESTAMPTZ,
  churned_at TIMESTAMPTZ,
  churn_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id)
);

CREATE TABLE public.agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  ai_phone_number TEXT,
  whatsapp_number TEXT,
  language TEXT CHECK (language IN ('ar','en','both')) DEFAULT 'both',
  custom_script TEXT,
  active_flows JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  deployed_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id)
);

CREATE TABLE public.billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_type TEXT CHECK (invoice_type IN ('setup','monthly','upsell')) DEFAULT 'monthly',
  amount_egp NUMERIC(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending','paid','overdue')) DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  payment_method TEXT CHECK (payment_method IN ('bank_transfer','instapay','cash','vodafone_cash','other')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.team_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin','member')) DEFAULT 'member',
  can_view_billing BOOLEAN DEFAULT false,
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============ GRANTS ============
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pipeline TO authenticated;
GRANT ALL ON public.pipeline TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_config TO authenticated;
GRANT ALL ON public.agent_config TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing TO authenticated;
GRANT ALL ON public.billing TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_access TO authenticated;
GRANT ALL ON public.team_access TO service_role;

-- ============ HELPER FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.is_team_member()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_access
    WHERE lower(email) = lower(coalesce((auth.jwt() ->> 'email')::text, ''))
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_billing()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_access
    WHERE lower(email) = lower(coalesce((auth.jwt() ->> 'email')::text, ''))
      AND can_view_billing = true
  );
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER pipeline_updated_at
  BEFORE UPDATE ON public.pipeline
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ RLS ============
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_access ENABLE ROW LEVEL SECURITY;

-- clients
CREATE POLICY "team can read clients" ON public.clients FOR SELECT TO authenticated USING (public.is_team_member());
CREATE POLICY "team can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (public.is_team_member());
CREATE POLICY "team can update clients" ON public.clients FOR UPDATE TO authenticated USING (public.is_team_member()) WITH CHECK (public.is_team_member());
CREATE POLICY "team can delete clients" ON public.clients FOR DELETE TO authenticated USING (public.is_team_member());

-- pipeline
CREATE POLICY "team can read pipeline" ON public.pipeline FOR SELECT TO authenticated USING (public.is_team_member());
CREATE POLICY "team can insert pipeline" ON public.pipeline FOR INSERT TO authenticated WITH CHECK (public.is_team_member());
CREATE POLICY "team can update pipeline" ON public.pipeline FOR UPDATE TO authenticated USING (public.is_team_member()) WITH CHECK (public.is_team_member());
CREATE POLICY "team can delete pipeline" ON public.pipeline FOR DELETE TO authenticated USING (public.is_team_member());

-- agent_config
CREATE POLICY "team can read agent_config" ON public.agent_config FOR SELECT TO authenticated USING (public.is_team_member());
CREATE POLICY "team can insert agent_config" ON public.agent_config FOR INSERT TO authenticated WITH CHECK (public.is_team_member());
CREATE POLICY "team can update agent_config" ON public.agent_config FOR UPDATE TO authenticated USING (public.is_team_member()) WITH CHECK (public.is_team_member());
CREATE POLICY "team can delete agent_config" ON public.agent_config FOR DELETE TO authenticated USING (public.is_team_member());

-- billing — select gated by can_view_billing; writes by any team member
CREATE POLICY "billing-authorized team can read" ON public.billing FOR SELECT TO authenticated USING (public.can_view_billing());
CREATE POLICY "team can insert billing" ON public.billing FOR INSERT TO authenticated WITH CHECK (public.is_team_member());
CREATE POLICY "team can update billing" ON public.billing FOR UPDATE TO authenticated USING (public.is_team_member()) WITH CHECK (public.is_team_member());
CREATE POLICY "team can delete billing" ON public.billing FOR DELETE TO authenticated USING (public.is_team_member());

-- team_access
CREATE POLICY "team can read team_access" ON public.team_access FOR SELECT TO authenticated USING (public.is_team_member());
CREATE POLICY "team can insert team_access" ON public.team_access FOR INSERT TO authenticated WITH CHECK (public.is_team_member());
CREATE POLICY "team can update team_access" ON public.team_access FOR UPDATE TO authenticated USING (public.is_team_member()) WITH CHECK (public.is_team_member());
CREATE POLICY "team can delete team_access" ON public.team_access FOR DELETE TO authenticated USING (public.is_team_member());

-- ============ VIEWS ============
CREATE VIEW public.client_overview
WITH (security_invoker = on) AS
SELECT
  c.id, c.business_name, c.owner_name, c.tier,
  c.industry, c.city, c.phone, c.whatsapp,
  p.status AS pipeline_status,
  p.went_live_at,
  COUNT(b.id) AS total_invoices,
  SUM(CASE WHEN b.status='paid'    THEN b.amount_egp ELSE 0 END) AS total_paid_egp,
  SUM(CASE WHEN b.status='pending' THEN b.amount_egp ELSE 0 END) AS total_pending_egp,
  SUM(CASE WHEN b.status='overdue' THEN b.amount_egp ELSE 0 END) AS total_overdue_egp
FROM public.clients c
LEFT JOIN public.pipeline p ON p.client_id = c.id
LEFT JOIN public.billing  b ON b.client_id = c.id
GROUP BY c.id, p.status, p.went_live_at;

CREATE VIEW public.revenue_by_tier
WITH (security_invoker = on) AS
SELECT
  c.tier,
  COUNT(DISTINCT c.id) AS client_count,
  SUM(b.amount_egp) AS total_billed_egp,
  SUM(CASE WHEN b.status='paid' THEN b.amount_egp ELSE 0 END) AS collected_egp
FROM public.clients c
LEFT JOIN public.billing b ON b.client_id = c.id
GROUP BY c.tier;

CREATE VIEW public.overdue_alerts
WITH (security_invoker = on) AS
SELECT
  c.business_name, c.owner_name, c.whatsapp,
  b.invoice_number, b.amount_egp, b.due_date,
  (now()::date - b.due_date) AS days_overdue
FROM public.billing b
JOIN public.clients c ON c.id = b.client_id
WHERE b.status='overdue'
ORDER BY days_overdue DESC;

GRANT SELECT ON public.client_overview TO authenticated;
GRANT SELECT ON public.revenue_by_tier TO authenticated;
GRANT SELECT ON public.overdue_alerts TO authenticated;
