
ALTER FUNCTION public.update_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.is_team_member() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_view_billing() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;
