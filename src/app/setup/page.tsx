"use client";

import { useEffect, useState } from "react";

export default function SetupPage() {
  const [status, setStatus] = useState<{ ok: boolean; hasAdmin: boolean; hasOwnerId: boolean } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      const res = await fetch("/api/meta");
      const j = await res.json().catch(() => null);
      if (!res.ok) {
        setErr((j as any)?.error ?? "Failed to load status");
        return;
      }
      setStatus(j);
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Status</h1>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">System</div>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Supabase admin key</span>
            <span className={status?.hasAdmin ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
              {status?.hasAdmin ? "OK" : "Missing"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Owner ID</span>
            <span className={status?.hasOwnerId ? "text-green-700 font-semibold" : "text-red-700 font-semibold"}>
              {status?.hasOwnerId ? "OK" : "Missing"}
            </span>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          This page is just a quick health check. No login is required for this app.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">Reminders</div>
        <div className="mt-2 text-sm text-slate-600">
          The Dashboard highlights due items based on “Next due date”.
        </div>
      </div>
    </div>
  );
}
