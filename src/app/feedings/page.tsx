"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Nav } from "@/components/Nav";
import { supabase } from "@/lib/supabase";

type Feeding = { id: string; fed_on: string; fed_at: string | null; feed_type: string; amount: number | null; unit: string | null };

export default function FeedingsPage() {
  const [rows, setRows] = useState<Feeding[]>([]);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data } = await supabase
        .from("feedings")
        .select("id,fed_on,fed_at,feed_type,amount,unit")
        .eq("user_id", uid)
        .order("fed_on", { ascending: false })
        .limit(50);
      setRows((data ?? []) as Feeding[]);
    }
    load();
  }, []);

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Feeding</h1>
          <Link className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white" href="/feedings/new">
            + Add
          </Link>
        </div>

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
    </AuthGuard>
  );
}
