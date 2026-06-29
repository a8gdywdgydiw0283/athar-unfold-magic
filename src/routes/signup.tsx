import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { isCurrentUserAdmin } from "@/lib/is-admin";

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
  const isAdmin = await isCurrentUserAdmin();
  if (isAdmin) navigate({ to: "/admin/dashboard", replace: true });
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
  const [oauthLoading, setOauthLoading] = useState(false);

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

  async function handleGoogle() {
    setOauthLoading(true); setError(null); setInfo(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setOauthLoading(false);
      return setError(result.error.message);
    }
    if (result.redirected) return;
    setOauthLoading(false);
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

          <div className="my-5 flex items-center gap-3 text-xs text-athar-muted">
            <span className="flex-1 h-px bg-athar-border" />
            <span>أو</span>
            <span className="flex-1 h-px bg-athar-border" />
          </div>

          <button type="button" onClick={handleGoogle} disabled={oauthLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-athar-border bg-white text-black px-4 py-2.5 text-sm font-semibold hover:bg-white/90 disabled:opacity-60">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.7 6.5 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.2 19 13.5 24 13.5c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.7 6.5 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 43.5c5 0 9.6-1.9 13.1-5l-6-5.1c-2 1.4-4.4 2.1-7.1 2.1-5.3 0-9.7-3-11.3-7.1l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.2 5.4l6 5.1C40.8 35.6 43.5 30.3 43.5 24c0-1.2-.1-2.4-.3-3.5z"/>
            </svg>
            {oauthLoading ? "..." : "الدخول بحساب Google"}
          </button>
        </div>
      </div>
    </div>
  );
}