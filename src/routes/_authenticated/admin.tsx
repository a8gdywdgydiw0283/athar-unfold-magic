import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "ATHAR — Admin Dashboard" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type ClientOverview = {
  id: string;
  business_name: string;
  owner_name: string;
  tier: string;
  industry: string | null;
  city: string | null;
  whatsapp: string | null;
  pipeline_status: string | null;
  total_invoices: number;
  total_paid_egp: number | null;
  total_pending_egp: number | null;
  total_overdue_egp: number | null;
};

function AdminPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [rows, setRows] = useState<ClientOverview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    supabase
      .from("client_overview")
      .select("*")
      .order("business_name")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows((data ?? []) as ClientOverview[]);
      });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="ltr">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← ATHAR site</Link>
            <h1 className="text-xl font-semibold mt-1">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{email}</span>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-input px-3 py-1.5 hover:bg-accent"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive mb-6">
            <p className="font-medium">Could not load clients.</p>
            <p className="mt-1 opacity-80">{error}</p>
            <p className="mt-2 text-xs opacity-80">
              If you just signed up, your email may not be in <code>team_access</code> yet. Ask an
              admin to add you, or run the SQL shown in the setup guide.
            </p>
          </div>
        )}

        <h2 className="text-lg font-semibold mb-4">Clients</h2>
        {!rows && !error && <p className="text-sm text-muted-foreground">Loading…</p>}
        {rows && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No clients visible.</p>
        )}
        {rows && rows.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Business</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Tier</th>
                  <th className="px-3 py-2 font-medium">Industry</th>
                  <th className="px-3 py-2 font-medium">City</th>
                  <th className="px-3 py-2 font-medium">Pipeline</th>
                  <th className="px-3 py-2 font-medium text-right">Paid (EGP)</th>
                  <th className="px-3 py-2 font-medium text-right">Overdue (EGP)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{r.business_name}</td>
                    <td className="px-3 py-2">{r.owner_name}</td>
                    <td className="px-3 py-2">{r.tier}</td>
                    <td className="px-3 py-2">{r.industry ?? "—"}</td>
                    <td className="px-3 py-2">{r.city ?? "—"}</td>
                    <td className="px-3 py-2">{r.pipeline_status ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{Number(r.total_paid_egp ?? 0).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{Number(r.total_overdue_egp ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}