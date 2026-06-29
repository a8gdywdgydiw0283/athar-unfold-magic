
-- Drop policies that depend on the helper
DROP POLICY IF EXISTS "Admins can read admin list" ON public.admins;
DROP POLICY IF EXISTS "Users read own lead" ON public.leads;
DROP POLICY IF EXISTS "Users update own lead" ON public.leads;

DROP FUNCTION IF EXISTS private.is_admin(uuid) CASCADE;

-- Admins: each admin can read their own row (enough for client admin-check)
CREATE POLICY "Admin reads own row"
  ON public.admins FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Leads: re-create with inline subquery checks
CREATE POLICY "Users read own lead"
  ON public.leads FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
  );

CREATE POLICY "Users update own lead"
  ON public.leads FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
  );
