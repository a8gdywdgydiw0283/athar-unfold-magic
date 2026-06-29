import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isCurrentUserAdmin } from "@/lib/is-admin";

export const Route = createFileRoute("/_client")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/signup" });
    const isAdmin = await isCurrentUserAdmin();
    if (isAdmin) throw redirect({ to: "/admin/dashboard" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});