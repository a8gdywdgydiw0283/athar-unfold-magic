import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_client/dashboard")({
  head: () => ({ meta: [{ title: "ATHAR — بيانات شركتك" }, { name: "robots", content: "noindex" }] }),
  component: ClientOnboardingOnly,
});

function ClientOnboardingOnly() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setEmail(u.user?.email ?? "");
      setUserId(u.user?.id ?? "");
      if (u.user?.id) {
        const { data: existing } = await supabase
          .from("leads").select("id").eq("user_id", u.user.id).maybeSingle();
        if (existing) setDone(true);
      }
      setLoading(false);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/signup", replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-athar-black text-athar-white flex items-center justify-center" dir="rtl">
        جارٍ التحميل…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-athar-black text-athar-white flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="w-full max-w-lg rounded-2xl border border-athar-border bg-athar-black/60 p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-athar-muted" dir="ltr">{email}</span>
          <button onClick={signOut} className="text-xs rounded-md border border-athar-border px-3 py-1.5 hover:bg-athar-border/30">
            خروج
          </button>
        </div>

        {done
          ? <ThankYou />
          : <OnboardingForm userId={userId} email={email} onDone={() => setDone(true)} />}
      </div>
    </div>
  );
}

function ThankYou() {
  return (
    <div className="text-center py-6">
      <div className="mx-auto w-12 h-12 rounded-full bg-athar-slash/20 flex items-center justify-center text-athar-slash text-2xl">✓</div>
      <h1 className="mt-4 text-2xl font-bold">تم استلام بياناتك</h1>
      <p className="mt-2 text-sm text-athar-muted">
        فريق ATHAR هيراجع بيانات شغلك ويتواصل معاك خلال 24 ساعة على الواتساب أو الإيميل.
      </p>
    </div>
  );
}

function OnboardingForm({
  userId, email, onDone,
}: { userId: string; email: string; onDone: () => void }) {
  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    phone: "",
    whatsapp: "",
    industry: "",
    city: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);

    const trimmed = {
      full_name: form.full_name.trim().slice(0, 100),
      business_name: form.business_name.trim().slice(0, 150),
      phone: form.phone.trim().slice(0, 30),
      whatsapp: form.whatsapp.trim().slice(0, 30),
      industry: form.industry.trim().slice(0, 80),
      city: form.city.trim().slice(0, 80),
    };

    const { error: insErr } = await supabase.from("leads").insert({
      user_id: userId,
      email,
      ...trimmed,
    });
    setSaving(false);
    if (insErr) return setError(insErr.message);
    onDone();
  }

  const field = (k: keyof typeof form, label: string, type = "text", maxLength = 100) => (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type={type} required maxLength={maxLength}
        value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })}
        className="w-full rounded-md border border-athar-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-athar-slash"
      />
    </div>
  );

  return (
    <>
      <h1 className="text-2xl font-bold">عرّفنا على شغلك</h1>
      <p className="mt-1 text-sm text-athar-muted">
        املأ البيانات دي عشان فريق ATHAR يتواصل معاك بعرض مناسب لبزنسك.
      </p>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        {field("full_name", "الاسم بالكامل", "text", 100)}
        {field("business_name", "اسم الشركة/البزنس", "text", 150)}
        {field("phone", "رقم الهاتف", "tel", 30)}
        {field("whatsapp", "رقم الواتساب", "tel", 30)}
        {field("industry", "المجال (مثلاً: عقارات، تعليم)", "text", 80)}
        {field("city", "المدينة", "text", 80)}
        {error && <p className="text-sm text-red-400 sm:col-span-2">{error}</p>}
        <button type="submit" disabled={saving}
          className="sm:col-span-2 rounded-md bg-athar-slash px-4 py-2.5 text-sm font-bold text-athar-black hover:brightness-110 disabled:opacity-60">
          {saving ? "جارٍ الإرسال…" : "أرسل بياناتي"}
        </button>
      </form>
    </>
  );
}