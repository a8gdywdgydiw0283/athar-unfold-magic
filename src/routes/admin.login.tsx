import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "ATHAR — Admin Login" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) return;
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (isAdmin) navigate({ to: "/admin/dashboard", replace: true });
    })();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signErr) { setLoading(false); return setError(signErr.message); }
    const { data: isAdmin } = await supabase.rpc("is_admin");
    setLoading(false);
    if (!isAdmin) {
      await supabase.auth.signOut();
      return setError("This account is not authorized for admin access.");
    }
    navigate({ to: "/admin/dashboard", replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 px-4" dir="ltr">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-xs text-zinc-500 hover:text-zinc-300 mb-6">← back</Link>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
          <p className="text-xs uppercase tracking-widest text-athar-slash">ATHAR · Internal</p>
          <h1 className="mt-1 text-2xl font-semibold">Admin Login</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider mb-1 text-zinc-400">Email</label>
              <input id="email" type="email" required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-athar-slash" />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider mb-1 text-zinc-400">Password</label>
              <input id="password" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-athar-slash" />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-md bg-athar-slash px-4 py-2.5 text-sm font-bold text-black hover:brightness-110 disabled:opacity-60">
              {loading ? "…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}