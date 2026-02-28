"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";

type HealthAlert = { title: string; next_due_date: string; cattle_id: string };
type TaskAlert = { id: string; title: string; due_on: string | null };

type Alert = { kind: "health" | "task"; title: string; dueOn: string; href: string };

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      const res = await fetch("/api/alerts");
      const j = await res.json();
      if (!res.ok) {
        setErr(j?.error ?? "Failed to load");
        return;
      }
      const a: Alert[] = [];
      (j.health as HealthAlert[]).forEach((h) =>
        a.push({ kind: "health", title: `Health due: ${h.title}`, dueOn: h.next_due_date, href: `/cattle/${h.cattle_id}` })
      );
      (j.tasks as TaskAlert[]).forEach((t) => a.push({ kind: "task", title: `Task: ${t.title}`, dueOn: t.due_on ?? j.today, href: `/tasks` }));
      setAlerts(a.slice(0, 8));
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Link className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white" href="/feedings/new">
          + Feeding
        </Link>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {err}
          <div className="mt-2 text-xs">Check Vercel env vars + Supabase schema.</div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">Due now</div>
        <div className="mt-2 grid gap-2">
          {alerts.length === 0 ? (
            <div className="text-sm text-slate-600">No urgent alerts. ✅</div>
          ) : (
            alerts.map((a, i) => (
              <Link key={i} href={a.href} className="rounded-xl bg-slate-50 p-3 text-sm">
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-slate-500">Due: {a.dueOn}</div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["Cattle", "/cattle"],
          ["Feed", "/feedings"],
          ["Tasks", "/tasks"],
          ["Sales", "/sales"],
          ["Finance", "/finance"],
        ].map(([label, href]) => (
          <Link key={href} href={href} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="font-semibold">{label}</div>
            <div className="text-sm text-slate-600">Open</div>
          </Link>
        ))}
      </div>

      <Nav current="/dashboard" />
    </div>
  );
}
