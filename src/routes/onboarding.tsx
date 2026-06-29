import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({ meta: [{ title: "ATHAR — Onboarding" }, { name: "robots", content: "noindex" }] }),
  component: OnboardingPage,
});

const INDUSTRIES = ["Healthcare / Clinics", "Legal", "Real Estate", "E-commerce", "Other"];
const VOLUMES = ["Less than 50/month", "50–200/month", "200–1000/month", "1000+/month"];
const LANGS = ["Arabic", "English", "Both"];

function OnboardingPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({
    full_name: "", business_name: "", industry: INDUSTRIES[0],
    process_description: "", monthly_volume: VOLUMES[0],
    preferred_language: LANGS[0], whatsapp_number: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { navigate({ to: "/", replace: true }); return; }
      setUserId(data.user.id);
      setChecking(false);
    })();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true); setError(null);
    const { error: insErr } = await supabase.from("onboarding_submissions").insert({
      user_id: userId,
      full_name: form.full_name.trim().slice(0, 120),
      business_name: form.business_name.trim().slice(0, 150),
      industry: form.industry,
      process_description: form.process_description.trim().slice(0, 2000),
      monthly_volume: form.monthly_volume,
      preferred_language: form.preferred_language,
      whatsapp_number: form.whatsapp_number.trim().slice(0, 30) || null,
    });
    setSaving(false);
    if (insErr) return setError(insErr.message);
    navigate({ to: "/thank-you", replace: true });
  }

  if (checking) {
    return <div className="min-h-screen bg-[#0A0A0A] text-athar-white flex items-center justify-center" dir="rtl">جارٍ التحميل…</div>;
  }

  const input = "w-full rounded-md border border-athar-border bg-transparent px-3 py-2.5 text-sm text-athar-white focus:outline-none focus:ring-2 focus:ring-athar-slash";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-athar-white px-4 py-12" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">عرّفنا على شغلك</h1>
        <p className="mt-2 text-sm text-athar-muted">
          املأ البيانات دي وفريق ATHAR هيرجعلك بعرض مخصص خلال 24 ساعة.
        </p>
        <form onSubmit={submit} className="mt-8 grid gap-5">
          <div>
            <label className="block text-sm mb-1.5">الاسم بالكامل / Full Name</label>
            <input required value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-sm mb-1.5">اسم الشركة / Business Name</label>
            <input required value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })} className={input} />
          </div>
          <div>
            <label className="block text-sm mb-1.5">المجال / Industry</label>
            <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className={input}>
              {INDUSTRIES.map((x) => <option key={x} value={x} className="bg-[#0A0A0A]">{x}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1.5">العملية اللي عايز تأتمتها / Process to Automate</label>
            <textarea required rows={4} value={form.process_description}
              onChange={(e) => setForm({ ...form, process_description: e.target.value })}
              placeholder="مثلاً: تذكير المرضى بمواعيدهم، متابعة العملاء المحتملين..."
              className={input} />
          </div>
          <div>
            <label className="block text-sm mb-1.5">الحجم الشهري / Current Volume</label>
            <select value={form.monthly_volume} onChange={(e) => setForm({ ...form, monthly_volume: e.target.value })}
              className={input}>
              {VOLUMES.map((x) => <option key={x} value={x} className="bg-[#0A0A0A]">{x}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1.5">اللغة المفضلة / Preferred Language</label>
            <select value={form.preferred_language} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
              className={input}>
              {LANGS.map((x) => <option key={x} value={x} className="bg-[#0A0A0A]">{x}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1.5">رقم واتساب / WhatsApp (اختياري)</label>
            <input type="tel" dir="ltr" value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className={input} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={saving}
            className="rounded-md bg-athar-slash px-4 py-3 text-sm font-bold text-athar-black hover:brightness-110 disabled:opacity-60">
            {saving ? "جارٍ الإرسال…" : "إرسال / Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}