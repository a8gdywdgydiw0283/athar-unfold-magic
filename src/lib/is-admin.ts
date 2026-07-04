import { supabase } from "@/integrations/supabase/client";

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) return false;
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) return false;
  return data === true;
}