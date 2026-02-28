"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";

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
      if (!supabase) return;
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data } = await supabase.from("cattle").select("id,tag").eq("user_id", uid).eq("status", "active");
      setCattle((data ?? []) as Cow[]);
      if (data && data.length) setCattleId(data[0].id);
    }
    load();
  }, []);

  async function save() {
    setErr(null);
    if (!supabase) return;
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;

    const { error } = await supabase.from("sales").insert({
      user_id: uid,
      cattle_id: cattleId || null,
      sold_on: soldOn,
      buyer: buyer || null,
      sale_price: Number(price),
      weight_kg: weight ? Number(weight) : null,
      notes: notes || null,
    });
    if (error) {
      setErr(error.message);
      return;
    }

    // Mark as sold
    if (cattleId) {
      await supabase.from("cattle").update({ status: "sold" }).eq("id", cattleId).eq("user_id", uid);
    }

    // Finance entry (income)
    await supabase.from("finance").insert({
      user_id: uid,
      trans_date: soldOn,
      kind: "income",
      category: "sale",
      amount: Number(price),
      notes: buyer ? `Sale to ${buyer}` : "Sale",
    });

    window.location.href = "/sales";
  }

  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}
