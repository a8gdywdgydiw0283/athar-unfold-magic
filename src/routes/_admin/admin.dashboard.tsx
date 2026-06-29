import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  head: () => ({ meta: [{ title: "ATHAR — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminDashboard,
});

type Row = {
  id: string; business_name: string; owner_name: string; tier: string;
  industry: string | null; city: string | null; pipeline_status: string | null;
  total_paid_egp: number | null; total_pending_egp: number | null; total_overdue_egp: number | null;
};

const STAGES = ["lead", "demo", "negotiation", "contract", "live", "churned"] as const;

function AdminDashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [tab, setTab] = useState<"pipeline" | "table">("pipeline");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    supabase.from("client_overview").select("*").order("business_name")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows((data ?? []) as Row[]);
      });
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" dir="ltr">
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-300">← site</Link>
            <h1 className="text-xl font-semibold mt-1">ATHAR Admin</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-500">{email}</span>
            <button onClick={signOut} className="rounded-md border border-zinc-800 px-3 py-1.5 hover:bg-zinc-900">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="inline-flex rounded-md border border-zinc-800 p-1 text-sm mb-6">
          <button onClick={() => setTab("pipeline")} className={`px-3 py-1 rounded ${tab === "pipeline" ? "bg-athar-slash text-black font-semibold" : "text-zinc-400"}`}>Pipeline</button>
          <button onClick={() => setTab("table")} className={`px-3 py-1 rounded ${tab === "table" ? "bg-athar-slash text-black font-semibold" : "text-zinc-400"}`}>Clients</button>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        {!rows && !error && <p className="text-sm text-zinc-500">Loading…</p>}

        {rows && tab === "pipeline" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {STAGES.map(stage => {
              const list = rows.filter(r => (r.pipeline_status ?? "lead") === stage);
              return (
                <div key={stage} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 min-h-[200px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs uppercase tracking-wider text-zinc-400">{stage}</h3>
                    <span className="text-xs text-zinc-500">{list.length}</span>
                  </div>
                  <div className="space-y-2">
                    {list.map(r => (
                      <div key={r.id} className="rounded-md bg-zinc-950 border border-zinc-800 p-2.5">
                        <p className="text-sm font-medium">{r.business_name}</p>
                        <p className="text-xs text-zinc-500">{r.owner_name}</p>
                        <p className="mt-1 text-xs text-athar-slash">{r.tier}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {rows && tab === "table" && (
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/60 text-left text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Business</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Tier</th>
                  <th className="px-3 py-2 font-medium">Industry</th>
                  <th className="px-3 py-2 font-medium">City</th>
                  <th className="px-3 py-2 font-medium">Pipeline</th>
                  <th className="px-3 py-2 font-medium text-right">Paid</th>
                  <th className="px-3 py-2 font-medium text-right">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2 font-medium">{r.business_name}</td>
                    <td className="px-3 py-2">{r.owner_name}</td>
                    <td className="px-3 py-2 text-athar-slash">{r.tier}</td>
                    <td className="px-3 py-2">{r.industry ?? "—"}</td>
                    <td className="px-3 py-2">{r.city ?? "—"}</td>
                    <td className="px-3 py-2">{r.pipeline_status ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{Number(r.total_paid_egp ?? 0).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-red-300">{Number(r.total_overdue_egp ?? 0).toLocaleString()}</td>
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