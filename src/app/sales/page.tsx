"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { Nav } from "@/components/Nav";
import { supabase } from "@/lib/supabase";

type Cow = { id: string; tag: string; status: string };

type Sale = { sold_on: string; sale_price: number; buyer: string | null; cattle_id: string | null };

export default function SalesPage() {
  const [cattle, setCattle] = useState<Cow[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const ready = useMemo(() => cattle.filter((c) => c.status === "active"), [cattle]);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data: c } = await supabase.from("cattle").select("id,tag,status").eq("user_id", uid);
      setCattle((c ?? []) as Cow[]);
      const { data: s } = await supabase.from("sales").select("sold_on,sale_price,buyer,cattle_id").eq("user_id", uid).order("sold_on", { ascending: false });
      setSales((s ?? []) as Sale[]);
    }
    load();
  }, []);

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Sales</h1>
          <Link className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white" href="/sales/new">
            + Record sale
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-sm font-semibold">Ready to sell (manual)</div>
          <div className="mt-3 space-y-2">
            {ready.slice(0, 10).map((c) => (
              <Link key={c.id} href={`/cattle/${c.id}`} className="block rounded-xl bg-slate-50 p-3 text-sm">
                <div className="font-semibold">Tag {c.tag}</div>
                <div className="text-xs text-slate-500">Open profile</div>
              </Link>
            ))}
            {ready.length === 0 && <div className="text-sm text-slate-600">No cattle added yet.</div>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-sm font-semibold">Past sales</div>
          <div className="mt-3 space-y-2">
            {sales.slice(0, 20).map((s, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <div>
                  <div className="font-semibold">{s.buyer ?? "Buyer"}</div>
                  <div className="text-xs text-slate-500">{s.sold_on}</div>
                </div>
                <div className="font-bold text-green-700">{s.sale_price}</div>
              </div>
            ))}
            {sales.length === 0 && <div className="text-sm text-slate-600">No sales recorded.</div>}
          </div>
        </div>

        <Nav current="/sales" />
      </div>
    </AuthGuard>
  );
}
