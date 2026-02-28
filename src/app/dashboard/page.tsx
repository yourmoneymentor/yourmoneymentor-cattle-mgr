"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";
import { toISODate } from "@/lib/utils";

type Alert = { kind: "health" | "task"; title: string; dueOn: string; href: string };

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const today = useMemo(() => toISODate(new Date()), []);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;

      const { data: health } = await supabase
        .from("health_events")
        .select("id,title,next_due_date,cattle_id")
        .eq("user_id", uid)
        .not("next_due_date", "is", null)
        .lte("next_due_date", today)
        .order("next_due_date", { ascending: true })
        .limit(5);

      const { data: tasks } = await supabase
        .from("tasks")
        .select("id,title,due_on")
        .eq("user_id", uid)
        .eq("completed", false)
        .or(`due_on.is.null,due_on.lte.${today}`)
        .limit(5);

      const a: Alert[] = [];
      (health ?? []).forEach((h) =>
        a.push({ kind: "health", title: `Health due: ${h.title}`, dueOn: h.next_due_date!, href: `/cattle/${h.cattle_id}` })
      );
      (tasks ?? []).forEach((t) => a.push({ kind: "task", title: `Task: ${t.title}`, dueOn: t.due_on ?? today, href: `/tasks` }));
      setAlerts(a.slice(0, 6));
    }
    load();
  }, [today]);

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <Link className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white" href="/feedings/new">
            + Feeding
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-sm font-semibold">Today</div>
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
          {["Cattle", "Feedings", "Tasks", "Health", "Weights", "Sales", "Finance"].map((x) => (
            <Link
              key={x}
              href={`/${x.toLowerCase() === "health" ? "cattle" : x.toLowerCase()}`}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="font-semibold">{x}</div>
              <div className="text-sm text-slate-600">Open</div>
            </Link>
          ))}
        </div>

        <Nav current="/dashboard" />
      </div>
    </AuthGuard>
  );
}
