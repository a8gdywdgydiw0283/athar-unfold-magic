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
  contacted: boolean; contacted_at: string | null;
};

type Onboarding = {
  id: string; full_name: string; business_name: string;
  industry: string; process_description: string; monthly_volume: string;
  preferred_language: string; whatsapp_number: string | null; created_at: string;
  contacted: boolean; contacted_at: string | null;
};

type Consultation = {
  id: string; name: string; email: string; whatsapp: string; created_at: string;
  contacted: boolean; contacted_at: string | null;
};

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

function AdminDashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState<Lead[] | null>(null);
  const [onboarding, setOnboarding] = useState<Onboarding[] | null>(null);
  const [consults, setConsults] = useState<Consultation[] | null>(null);
  const [tab, setTab] = useState<"onboarding" | "consultations" | "leads">("onboarding");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [l, o, c] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("onboarding_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("consultation_requests").select("*").order("created_at", { ascending: false }),
    ]);
    if (l.error) setError(l.error.message); else setRows(l.data ?? []);
    if (o.error) setError(o.error.message); else setOnboarding(o.data ?? []);
    if (c.error) setError(c.error.message); else setConsults(c.data ?? []);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    setRows(rs => rs?.map(r => r.id === id ? { ...r, status } : r) ?? null);
    await supabase.from("leads").update({ status }).eq("id", id);
  }

  async function toggleContacted(
    table: "consultation_requests" | "onboarding_submissions" | "leads",
    id: string,
    next: boolean,
  ) {
    const { data: u } = await supabase.auth.getUser();
    const patch = {
      contacted: next,
      contacted_at: next ? new Date().toISOString() : null,
      contacted_by: next ? (u.user?.id ?? null) : null,
    };
    if (table === "consultation_requests") {
      setConsults(cs => cs?.map(c => c.id === id ? { ...c, ...patch } : c) ?? null);
    } else if (table === "onboarding_submissions") {
      setOnboarding(os => os?.map(o => o.id === id ? { ...o, ...patch } : o) ?? null);
    } else {
      setRows(rs => rs?.map(r => r.id === id ? { ...r, ...patch } : r) ?? null);
    }
    const { error: e } = await supabase.from(table).update(patch).eq("id", id);
    if (e) { setError(e.message); load(); }
  }

  function ContactedCell({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="h-4 w-4 accent-athar-slash"
        />
        <span className={`text-xs ${checked ? "text-emerald-400" : "text-zinc-500"}`}>
          {checked ? "تم التواصل" : "لم يتم"}
        </span>
      </label>
    );
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
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex gap-2">
            {([
              ["onboarding", `Onboarding (${onboarding?.length ?? 0})`],
              ["consultations", `Consultations (${consults?.length ?? 0})`],
              ["leads", `Leads (${rows?.length ?? 0})`],
            ] as const).map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`text-xs rounded-md border px-3 py-1.5 ${tab===k ? "bg-athar-slash text-black border-athar-slash" : "border-zinc-800 hover:bg-zinc-900"}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={load} className="text-xs rounded-md border border-zinc-800 px-3 py-1.5 hover:bg-zinc-900">Refresh</button>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        {tab === "onboarding" && (
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            {!onboarding ? <p className="p-4 text-sm text-zinc-500">Loading…</p> :
             onboarding.length === 0 ? <p className="p-4 text-sm text-zinc-500">No onboarding submissions yet.</p> : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/60 text-left text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Business</th>
                  <th className="px-3 py-2 font-medium">Industry</th>
                  <th className="px-3 py-2 font-medium">Process</th>
                  <th className="px-3 py-2 font-medium">Volume</th>
                  <th className="px-3 py-2 font-medium">Lang</th>
                  <th className="px-3 py-2 font-medium">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {onboarding.map(o => (
                  <tr key={o.id} className="border-t border-zinc-800 align-top">
                    <td className="px-3 py-2 text-zinc-500 whitespace-nowrap">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2 font-medium">{o.full_name}</td>
                    <td className="px-3 py-2">{o.business_name}</td>
                    <td className="px-3 py-2">{o.industry}</td>
                    <td className="px-3 py-2 max-w-md whitespace-pre-wrap">{o.process_description}</td>
                    <td className="px-3 py-2">{o.monthly_volume}</td>
                    <td className="px-3 py-2">{o.preferred_language}</td>
                    <td className="px-3 py-2" dir="ltr">{o.whatsapp_number ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>)}
          </div>
        )}

        {tab === "consultations" && (
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            {!consults ? <p className="p-4 text-sm text-zinc-500">Loading…</p> :
             consults.length === 0 ? <p className="p-4 text-sm text-zinc-500">No consultation requests yet.</p> : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/60 text-left text-zinc-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {consults.map(c => (
                  <tr key={c.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2 text-zinc-500 whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2 font-medium">{c.name}</td>
                    <td className="px-3 py-2" dir="ltr">{c.email}</td>
                    <td className="px-3 py-2" dir="ltr">{c.whatsapp}</td>
                  </tr>
                ))}
              </tbody>
            </table>)}
          </div>
        )}

        {tab === "leads" && rows && rows.length === 0 && (
          <p className="text-sm text-zinc-500">No leads yet. Submissions will appear here.</p>
        )}

        {tab === "leads" && rows && rows.length > 0 && (
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