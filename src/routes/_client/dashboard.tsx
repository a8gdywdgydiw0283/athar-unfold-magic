import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_client/dashboard")({
  head: () => ({ meta: [{ title: "ATHAR — لوحة العميل" }, { name: "robots", content: "noindex" }] }),
  component: ClientDashboard,
});

type Profile = {
  id: string; client_id: string | null; full_name: string | null;
  business_name: string | null; phone: string | null; whatsapp: string | null;
  industry: string | null; city: string | null; onboarded: boolean;
};
type Client = { id: string; business_name: string; tier: string | null };
type Pipeline = { status: string | null; demo_booked_at: string | null; went_live_at: string | null };
type Invoice = { id: string; invoice_number: string; amount_egp: number; status: string | null; due_date: string | null; paid_at: string | null };
type Agent = { ai_phone_number: string | null; whatsapp_number: string | null; language: string | null; is_active: boolean | null };

function ClientDashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    setEmail(u.user?.email ?? "");
    const { data: prof } = await supabase.from("users_profile").select("*").eq("id", u.user!.id).maybeSingle();
    setProfile(prof as Profile | null);
    if (prof?.client_id) {
      const [c, p, b, a] = await Promise.all([
        supabase.from("clients").select("id,business_name,tier").eq("id", prof.client_id).maybeSingle(),
        supabase.from("pipeline").select("status,demo_booked_at,went_live_at").eq("client_id", prof.client_id).maybeSingle(),
        supabase.from("billing").select("id,invoice_number,amount_egp,status,due_date,paid_at").eq("client_id", prof.client_id).order("created_at", { ascending: false }),
        supabase.from("agent_config").select("ai_phone_number,whatsapp_number,language,is_active").eq("client_id", prof.client_id).maybeSingle(),
      ]);
      setClient(c.data as Client | null);
      setPipeline(p.data as Pipeline | null);
      setInvoices((b.data ?? []) as Invoice[]);
      setAgent(a.data as Agent | null);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/signup", replace: true });
  }

  if (loading) return <div className="min-h-screen bg-athar-black text-athar-white flex items-center justify-center" dir="rtl">جارٍ التحميل…</div>;

  if (profile && !profile.onboarded) return <Onboarding profile={profile} onDone={load} email={email} />;

  return (
    <div className="min-h-screen bg-athar-black text-athar-white" dir="rtl">
      <header className="border-b border-athar-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-athar-muted">لوحة العميل</p>
            <h1 className="text-lg font-bold">{client?.business_name ?? "—"}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-athar-muted" dir="ltr">{email}</span>
            <button onClick={signOut} className="rounded-md border border-athar-border px-3 py-1.5 hover:bg-athar-border/30">خروج</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid gap-6 md:grid-cols-2">
        <Card title="باقتك الحالية">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-athar-slash">{client?.tier ?? "—"}</span>
            <span className="text-sm text-athar-muted">المرحلة: {pipeline?.status ?? "—"}</span>
          </div>
          {pipeline?.went_live_at && <p className="mt-2 text-xs text-emerald-400">شغّال منذ {new Date(pipeline.went_live_at).toLocaleDateString("ar-EG")}</p>}
        </Card>

        <Card title="احجز استشارة 30 دقيقة">
          <p className="text-sm text-athar-muted mb-3">اختار وقت يناسبك ومتنساش تحضّر أسئلتك.</p>
          <a href="https://calendly.com/" target="_blank" rel="noreferrer"
             className="inline-flex items-center px-4 py-2 bg-athar-slash text-athar-black text-sm font-bold hover:brightness-110">
            احجز الآن
          </a>
        </Card>

        <Card title="الفواتير" full>
          {invoices.length === 0 ? <p className="text-sm text-athar-muted">لا توجد فواتير حتى الآن.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-athar-muted text-right">
                  <tr><th className="py-2">رقم</th><th>المبلغ (ج.م)</th><th>الحالة</th><th>تاريخ الاستحقاق</th><th></th></tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} className="border-t border-athar-border">
                      <td className="py-2" dir="ltr">{inv.invoice_number}</td>
                      <td>{Number(inv.amount_egp).toLocaleString()}</td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td dir="ltr">{inv.due_date ?? "—"}</td>
                      <td>{inv.status !== "paid" && <button className="px-3 py-1 bg-athar-slash text-athar-black text-xs font-bold">ادفع الآن</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="إعدادات الـ Agent">
          {agent ? (
            <ul className="text-sm space-y-2">
              <li><span className="text-athar-muted">رقم المكالمات: </span><span dir="ltr">{agent.ai_phone_number ?? "—"}</span></li>
              <li><span className="text-athar-muted">واتساب: </span><span dir="ltr">{agent.whatsapp_number ?? "—"}</span></li>
              <li><span className="text-athar-muted">اللغة: </span>{agent.language ?? "—"}</li>
              <li><span className="text-athar-muted">الحالة: </span>{agent.is_active ? "نشط" : "غير نشط"}</li>
            </ul>
          ) : <p className="text-sm text-athar-muted">لسه ما اتسطّبش — فريقنا هيتواصل معاك.</p>}
        </Card>

        <Card title="الدعم" full>
          <SupportForm email={email} />
        </Card>
      </main>
    </div>
  );
}

function Card({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) {
  return (
    <section className={`rounded-2xl border border-athar-border bg-athar-black/40 p-6 ${full ? "md:col-span-2" : ""}`}>
      <h2 className="text-sm font-semibold text-athar-muted mb-3">{title}</h2>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, string> = {
    paid: "bg-emerald-500/20 text-emerald-300",
    pending: "bg-yellow-500/20 text-yellow-300",
    overdue: "bg-red-500/20 text-red-300",
  };
  const label: Record<string, string> = { paid: "مدفوعة", pending: "معلّقة", overdue: "متأخرة" };
  const k = status ?? "pending";
  return <span className={`px-2 py-0.5 rounded text-xs ${map[k] ?? "bg-athar-border/30"}`}>{label[k] ?? k}</span>;
}

function SupportForm({ email }: { email: string }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = encodeURIComponent(`من: ${email}\n\n${msg}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setSent(true);
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <textarea required value={msg} onChange={e => setMsg(e.target.value)}
        placeholder="اكتب استفسارك هنا…" rows={4}
        className="w-full rounded-md border border-athar-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-athar-slash" />
      <button className="px-4 py-2 bg-athar-slash text-athar-black text-sm font-bold hover:brightness-110">أرسل</button>
      {sent && <p className="text-xs text-emerald-400">تم — هنرد عليك على الواتساب.</p>}
    </form>
  );
}

function Onboarding({ profile, onDone, email }: { profile: Profile; onDone: () => void; email: string }) {
  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    business_name: profile.business_name ?? "",
    phone: profile.phone ?? "",
    whatsapp: profile.whatsapp ?? "",
    industry: profile.industry ?? "",
    city: profile.city ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    const { error: profErr } = await supabase.from("users_profile")
      .update({ ...form, onboarded: true })
      .eq("id", profile.id);
    if (profErr) { setSaving(false); return setError(profErr.message); }
    if (profile.client_id) {
      await supabase.from("clients").update({
        business_name: form.business_name || "New Client",
        owner_name: form.full_name || email,
        phone: form.phone, whatsapp: form.whatsapp,
        industry: form.industry, city: form.city,
      }).eq("id", profile.client_id);
    }
    setSaving(false);
    onDone();
  }

  const field = (k: keyof typeof form, label: string, type = "text") => (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input type={type} required value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })}
        className="w-full rounded-md border border-athar-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-athar-slash" />
    </div>
  );

  return (
    <div className="min-h-screen bg-athar-black text-athar-white flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="w-full max-w-lg rounded-2xl border border-athar-border bg-athar-black/60 p-8">
        <h1 className="text-2xl font-bold">أهلًا بيك في ATHAR</h1>
        <p className="mt-1 text-sm text-athar-muted">عرّفنا على شغلك في دقيقة عشان نجهّز اللوحة بشكل صحيح.</p>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          {field("full_name", "الاسم بالكامل")}
          {field("business_name", "اسم الشركة/البزنس")}
          {field("phone", "رقم الهاتف", "tel")}
          {field("whatsapp", "رقم الواتساب", "tel")}
          {field("industry", "المجال (مثلاً: عقارات، تعليم)")}
          {field("city", "المدينة")}
          {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
          <button type="submit" disabled={saving}
            className="sm:col-span-2 rounded-md bg-athar-slash px-4 py-2.5 text-sm font-bold text-athar-black hover:brightness-110 disabled:opacity-60">
            {saving ? "جارٍ الحفظ…" : "ابدأ الآن"}
          </button>
        </form>
      </div>
    </div>
  );
}