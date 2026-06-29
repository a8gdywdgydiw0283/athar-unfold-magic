GRANT EXECUTE ON FUNCTION public.can_view_billing() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_team_member() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_client_id() TO authenticated, anon;