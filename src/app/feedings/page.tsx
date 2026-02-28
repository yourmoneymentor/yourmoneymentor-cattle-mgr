"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";

type Feeding = { id: string; fed_on: string; fed_at: string | null; feed_type: string; amount: number | null; unit: string | null };

export default function FeedingsPage() {
  const [rows, setRows] = useState<Feeding[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      const res = await fetch("/api/feedings");
      const j = await res.json();
      if (!res.ok) {
        setErr(j?.error ?? "Failed to load feedings");
        return;
      }
      setRows((j.feedings ?? []) as Feeding[]);
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Feeding</h1>
        <Link className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white" href="/feedings/new">
          + Add
        </Link>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div>}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex justify-between gap-2">
              <div className="font-semibold">{r.feed_type}</div>
              <div className="text-sm text-slate-600">{r.fed_on}</div>
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {r.amount ?? "—"} {r.unit ?? ""} {r.fed_at ? `@ ${r.fed_at}` : ""}
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-slate-600">No feedings yet.</div>}
      </div>

      <Nav current="/feedings" />
    </div>
  );
}
