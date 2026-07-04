import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const ATHAR_LOGIN_EVENT = "athar:login";
export const ATHAR_CONSULT_EVENT = "athar:consult";

export function openLoginModal() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ATHAR_LOGIN_EVENT));
}
export function openConsultModal() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ATHAR_CONSULT_EVENT));
}

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-athar-border bg-[#0A0A0A] p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()} dir="rtl">
        <button onClick={onClose} className="float-left text-athar-muted hover:text-athar-white text-xl leading-none">×</button>
        {children}
      </div>
    </div>
  );
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const creds = { email: email.trim(), password };
    let result;
    if (mode === "signup") {
      result = await supabase.auth.signUp({
        ...creds,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
    } else {
      result = await supabase.auth.signInWithPassword(creds);
    }
    setLoading(false);
    if (result.error) return setError(result.error.message);
    if (!result.data.session) {
      return setError("تحقق من بريدك لتأكيد الحساب ثم سجّل الدخول.");
    }
    onClose();
    window.location.href = "/onboarding";
  }

  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-xl font-bold text-athar-white">
        {mode === "signin" ? "سجّل الدخول" : "أنشئ حسابك"}
      </h2>
      <p className="mt-1 text-sm text-athar-muted">
        {mode === "signin" ? "ادخل بإيميلك وكلمة السر." : "خطوة واحدة وتقدر تدخل بيانات شغلك."}
      </p>
      <div className="mt-4 inline-flex rounded-md border border-athar-border p-1 text-xs">
        <button type="button" onClick={() => { setMode("signin"); setError(null); }}
          className={`px-3 py-1 rounded ${mode === "signin" ? "bg-athar-slash text-athar-black font-semibold" : "text-athar-muted"}`}>
          دخول
        </button>
        <button type="button" onClick={() => { setMode("signup"); setError(null); }}
          className={`px-3 py-1 rounded ${mode === "signup" ? "bg-athar-slash text-athar-black font-semibold" : "text-athar-muted"}`}>
          حساب جديد
        </button>
      </div>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <input type="email" required dir="ltr" autoFocus value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
          className="w-full rounded-md border border-athar-border bg-transparent px-3 py-2.5 text-sm text-athar-white focus:outline-none focus:ring-2 focus:ring-athar-slash" />
        <input type="password" required minLength={6} dir="ltr" value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
          className="w-full rounded-md border border-athar-border bg-transparent px-3 py-2.5 text-sm text-athar-white focus:outline-none focus:ring-2 focus:ring-athar-slash" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded-md bg-athar-slash px-4 py-2.5 text-sm font-bold text-athar-black hover:brightness-110 disabled:opacity-60">
          {loading ? "..." : mode === "signin" ? "دخول" : "إنشاء حساب"}
        </button>
      </form>
    </ModalShell>
  );
}

function ConsultModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const payload = {
      name: form.name.trim().slice(0, 100),
      email: form.email.trim().slice(0, 255),
      whatsapp: form.whatsapp.trim().slice(0, 30),
    };
    const { error: rpcErr } = await supabase.rpc("submit_consultation", {
      _name: payload.name,
      _email: payload.email,
      _whatsapp: payload.whatsapp,
    });
    if (rpcErr) { setLoading(false); return setError(rpcErr.message); }

    try {
      await supabase.functions.invoke("send-consultation-email", { body: payload });
    } catch (_) { /* email failure shouldn't block UX */ }

    setLoading(false); setDone(true);
  }

  return (
    <ModalShell onClose={onClose}>
      {done ? (
        <div className="text-center py-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-athar-slash/20 flex items-center justify-center text-athar-slash text-2xl">✓</div>
          <h2 className="mt-4 text-xl font-bold text-athar-white">تم الإرسال!</h2>
          <p className="mt-2 text-sm text-athar-muted">سنحجز موعدك قريباً — Sent! We'll schedule your appointment soon.</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold text-athar-white">احجز استشارة مجانية</h2>
          <p className="mt-1 text-sm text-athar-muted">سيب بياناتك وفريقنا هيتواصل معاك.</p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <input required maxLength={100} placeholder="الاسم بالكامل" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-athar-border bg-transparent px-3 py-2.5 text-sm text-athar-white focus:outline-none focus:ring-2 focus:ring-athar-slash" />
            <input required type="email" dir="ltr" placeholder="email@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-athar-border bg-transparent px-3 py-2.5 text-sm text-athar-white focus:outline-none focus:ring-2 focus:ring-athar-slash" />
            <input required type="tel" dir="ltr" placeholder="WhatsApp +20..." value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full rounded-md border border-athar-border bg-transparent px-3 py-2.5 text-sm text-athar-white focus:outline-none focus:ring-2 focus:ring-athar-slash" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-md bg-athar-slash px-4 py-2.5 text-sm font-bold text-athar-black hover:brightness-110 disabled:opacity-60">
              {loading ? "جارٍ الإرسال…" : "احجز استشارتي"}
            </button>
          </form>
        </>
      )}
    </ModalShell>
  );
}

export default function AuthModals() {
  const [showLogin, setShowLogin] = useState(false);
  const [showConsult, setShowConsult] = useState(false);

  useEffect(() => {
    const onLogin = () => setShowLogin(true);
    const onConsult = () => setShowConsult(true);
    window.addEventListener(ATHAR_LOGIN_EVENT, onLogin);
    window.addEventListener(ATHAR_CONSULT_EVENT, onConsult);
    return () => {
      window.removeEventListener(ATHAR_LOGIN_EVENT, onLogin);
      window.removeEventListener(ATHAR_CONSULT_EVENT, onConsult);
    };
  }, []);

  return (
    <>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showConsult && <ConsultModal onClose={() => setShowConsult(false)} />}
    </>
  );
}