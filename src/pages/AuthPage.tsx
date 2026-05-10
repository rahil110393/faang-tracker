import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Check your email to confirm your account, then sign in.");
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl bg-slate-900 p-6 ring-1 ring-slate-800"
      >
        <h1 className="text-2xl font-bold text-slate-50">FAANG Prep Tracker</h1>
        <p className="mt-1 text-sm text-slate-400">
          {mode === "signin" ? "Sign in to your tracker" : "Create your tracker account"}
        </p>

        <label className="mt-5 block text-xs uppercase tracking-wide text-slate-400">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded bg-slate-950 px-3 py-2 text-sm ring-1 ring-slate-700 focus:ring-sky-500"
        />

        <label className="mt-3 block text-xs uppercase tracking-wide text-slate-400">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded bg-slate-950 px-3 py-2 text-sm ring-1 ring-slate-700 focus:ring-sky-500"
        />

        {err && <div className="mt-3 text-sm text-red-400">{err}</div>}
        {info && <div className="mt-3 text-sm text-emerald-400">{info}</div>}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded bg-sky-600 px-3 py-2 text-sm font-semibold hover:bg-sky-500 disabled:opacity-50"
        >
          {busy ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-3 w-full text-xs text-slate-400 hover:text-slate-200"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
