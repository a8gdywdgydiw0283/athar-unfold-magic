
ALTER TABLE public.consultation_requests
  ADD COLUMN IF NOT EXISTS contacted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS contacted_by uuid;

ALTER TABLE public.onboarding_submissions
  ADD COLUMN IF NOT EXISTS contacted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS contacted_by uuid;

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS contacted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS contacted_by uuid;

DROP POLICY IF EXISTS "Admins update consultations" ON public.consultation_requests;
CREATE POLICY "Admins update consultations"
  ON public.consultation_requests
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins update onboarding" ON public.onboarding_submissions;
CREATE POLICY "Admins update onboarding"
  ON public.onboarding_submissions
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));
