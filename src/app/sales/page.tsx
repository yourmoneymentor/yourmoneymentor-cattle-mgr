"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";

type Cow = { id: string; tag: string; status: string };

type Sale = { sold_on: string; sale_price: number; buyer: string | null; cattle_id: string | null };

export default function SalesPage() {
  const [cattle, setCattle] = useState<Cow[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      const [cRes, sRes] = await Promise.all([fetch("/api/cattle"), fetch("/api/sales")]);
      const cj = await cRes.json();
      const sj = await sRes.json();
      if (!cRes.ok) return setErr(cj?.error ?? "Failed to load cattle");
      if (!sRes.ok) return setErr(sj?.error ?? "Failed to load sales");
      setCattle((cj.cattle ?? []) as Cow[]);
      setSales((sj.sales ?? []) as Sale[]);
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Sales</h1>
        <Link className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white" href="/sales/new">
          + Record sale
        </Link>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">Cattle (tap to view weights/readiness)</div>
        <div className="mt-3 space-y-2">
          {cattle.slice(0, 20).map((c) => (
            <Link key={c.id} href={`/cattle/${c.id}`} className="block rounded-xl bg-slate-50 p-3 text-sm">
              <div className="font-semibold">Tag {c.tag}</div>
              <div className="text-xs text-slate-500">Status: {c.status}</div>
            </Link>
          ))}
          {cattle.length === 0 && <div className="text-sm text-slate-600">No cattle added yet.</div>}
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
  );
}
