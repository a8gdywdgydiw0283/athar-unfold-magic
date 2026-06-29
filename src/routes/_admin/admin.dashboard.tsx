import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  head: () => ({ meta: [{ title: "ATHAR — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminDashboard,
});

type Lead = {
  id: string; full_name: string; business_name: string;
  email: string | null; phone: string; whatsapp: string | null;
  industry: string | null; city: string | null; notes: string | null;
  status: string; created_at: string;
};

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

function AdminDashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("leads").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows(data ?? []);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    setRows(rs => rs?.map(r => r.id === id ? { ...r, status } : r) ?? null);
    await supabase.from("leads").update({ status }).eq("id", id);
  }

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
            <h1 className="text-xl font-semibold mt-1">ATHAR Admin · Leads</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-500">{email}</span>
            <button onClick={signOut} className="rounded-md border border-zinc-800 px-3 py-1.5 hover:bg-zinc-900">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-zinc-400">{rows?.length ?? 0} total</p>
          <button onClick={load} className="text-xs rounded-md border border-zinc-800 px-3 py-1.5 hover:bg-zinc-900">Refresh</button>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        {!rows && !error && <p className="text-sm text-zinc-500">Loading…</p>}

        {rows && rows.length === 0 && (
          <p className="text-sm text-zinc-500">No leads yet. Submissions will appear here.</p>
        )}

        {rows && rows.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/60 text-left text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Business</th>
                  <th className="px-3 py-2 font-medium">Phone</th>
                  <th className="px-3 py-2 font-medium">WhatsApp</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Industry</th>
                  <th className="px-3 py-2 font-medium">City</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t border-zinc-800 align-top">
                    <td className="px-3 py-2 text-zinc-500 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2 font-medium">{r.full_name}</td>
                    <td className="px-3 py-2">{r.business_name}</td>
                    <td className="px-3 py-2" dir="ltr">{r.phone}</td>
                    <td className="px-3 py-2" dir="ltr">{r.whatsapp ?? "—"}</td>
                    <td className="px-3 py-2" dir="ltr">{r.email ?? "—"}</td>
                    <td className="px-3 py-2">{r.industry ?? "—"}</td>
                    <td className="px-3 py-2">{r.city ?? "—"}</td>
                    <td className="px-3 py-2">
                      <select
                        value={r.status}
                        onChange={e => updateStatus(r.id, e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
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