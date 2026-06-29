import { supabase } from "@/integrations/supabase/client";

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) return false;
  const { data } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}