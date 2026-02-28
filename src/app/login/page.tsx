"use client";

import { useEffect, useState } from "react";
import { SetupNotice } from "@/components/SetupNotice";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = "/dashboard";
    });
  }, []);

  async function sendLink() {
    setError(null);
    setSent(null);
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
      },
    });
    if (error) setError(error.message);
    else setSent("Check your email for the login link.");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Log in</h1>
      {!supabase ? (
        <SetupNotice />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <label className="block text-sm font-semibold">Email</label>
          <input className="mt-2 w-full" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@farm.com" />
          <button className="mt-3 w-full bg-green-700 text-white" onClick={sendLink}>
            Send login link
          </button>
          {sent && <div className="mt-2 text-sm text-green-700">{sent}</div>}
          {error && <div className="mt-2 text-sm text-red-700">{error}</div>}
          <div className="mt-3 text-xs text-slate-500">Tip: add this app to your home screen for one-tap access.</div>
        </div>
      )}
    </div>
  );
}
