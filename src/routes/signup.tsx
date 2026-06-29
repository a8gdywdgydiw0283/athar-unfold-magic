import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "ATHAR — سجّل واحجز استشارتك" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

async function routeAfterLogin(navigate: ReturnType<typeof useNavigate>) {
  const { data } = await supabase.rpc("is_admin");
  if (data === true) navigate({ to: "/admin/dashboard", replace: true });
  else navigate({ to: "/dashboard", replace: true });
}

function SignupPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) routeAfterLogin(navigate);
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setInfo(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/dashboard" },
      });
      setLoading(false);
      if (error) return setError(error.message);
      if (data.session) return routeAfterLogin(navigate);
      return setInfo("تم إنشاء الحساب. سجّل الدخول للمتابعة.");
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    routeAfterLogin(navigate);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-athar-black text-athar-white px-4" dir="rtl">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-sm text-athar-muted hover:text-athar-white mb-6">→ الرجوع للموقع</Link>
        <div className="rounded-2xl border border-athar-border bg-athar-black/60 p-8">
          <h1 className="text-2xl font-bold">
            {mode === "signup" ? "سجّل الآن واحجز استشارتك" : "تسجيل الدخول"}
          </h1>
          <p className="mt-1 text-sm text-athar-muted">
            {mode === "signup" ? "خطوة واحدة وتفتح لوحة العميل." : "أهلًا بك من جديد."}
          </p>

          <div className="mt-5 inline-flex rounded-md border border-athar-border p-1 text-sm">
            <button type="button" onClick={() => { setMode("signup"); setError(null); setInfo(null); }}
              className={`px-3 py-1 rounded ${mode === "signup" ? "bg-athar-slash text-athar-black font-semibold" : "text-athar-muted"}`}>
              حساب جديد
            </button>
            <button type="button" onClick={() => { setMode("signin"); setError(null); setInfo(null); }}
              className={`px-3 py-1 rounded ${mode === "signin" ? "bg-athar-slash text-athar-black font-semibold" : "text-athar-muted"}`}>
              دخول
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm mb-1">البريد الإلكتروني</label>
              <input id="email" type="email" required autoComplete="email" dir="ltr"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-athar-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-athar-slash" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm mb-1">كلمة السر</label>
              <input id="password" type="password" required minLength={6} dir="ltr"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-athar-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-athar-slash" />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {info && <p className="text-sm text-emerald-400">{info}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-md bg-athar-slash px-4 py-2.5 text-sm font-bold text-athar-black hover:brightness-110 disabled:opacity-60">
              {loading ? "..." : mode === "signup" ? "سجّل الآن" : "دخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}