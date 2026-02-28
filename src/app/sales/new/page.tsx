"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Cow = { id: string; tag: string };

export default function NewSale() {
  const [cattle, setCattle] = useState<Cow[]>([]);
  const [cattleId, setCattleId] = useState<string>("");
  const [soldOn, setSoldOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [buyer, setBuyer] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/cattle");
      const j = await res.json();
      if (res.ok) {
        setCattle((j.cattle ?? []) as Cow[]);
        if (j.cattle?.length) setCattleId(j.cattle[0].id);
      }
    }
    load();
  }, []);

  async function save() {
    setErr(null);
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cattle_id: cattleId || null,
        sold_on: soldOn,
        buyer,
        sale_price: Number(price),
        weight_kg: weight ? Number(weight) : null,
        notes,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(j?.error ?? "Failed to save");
      return;
    }
    window.location.href = "/sales";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Record sale</h1>
        <Link className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" href="/sales">
          Back
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <div>
          <div className="text-sm font-semibold">Animal</div>
          <select className="mt-1 w-full" value={cattleId} onChange={(e) => setCattleId(e.target.value)}>
            {cattle.map((c) => (
              <option key={c.id} value={c.id}>
                Tag {c.tag}
              </option>
            ))}
            {!cattle.length && <option value="">(No cattle yet)</option>}
          </select>
        </div>
        <div>
          <div className="text-sm font-semibold">Date sold</div>
          <input className="mt-1 w-full" type="date" value={soldOn} onChange={(e) => setSoldOn(e.target.value)} />
        </div>
        <div>
          <div className="text-sm font-semibold">Buyer (optional)</div>
          <input className="mt-1 w-full" value={buyer} onChange={(e) => setBuyer(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-semibold">Sale price</div>
            <input className="mt-1 w-full" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 1200" />
          </div>
          <div>
            <div className="text-sm font-semibold">Weight (kg, optional)</div>
            <input className="mt-1 w-full" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold">Notes (optional)</div>
          <textarea className="mt-1 w-full" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        <button className="w-full bg-green-700 text-white" onClick={save}>
          Save
        </button>
        {err && <div className="text-sm text-red-700">{err}</div>}
      </div>
    </div>
  );
}
