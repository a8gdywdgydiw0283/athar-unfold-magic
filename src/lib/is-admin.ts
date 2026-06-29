import { supabase } from "@/integrations/supabase/client";

/**
 * Check whether the currently signed-in user is an ATHAR admin.
 * Membership is gated by team_access.user_id = auth.uid() via RLS,
 * so non-admins simply get back no rows.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) return false;
  const { data } = await supabase
    .from("team_access")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}