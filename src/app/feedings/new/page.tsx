"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function NewFeeding() {
  const [fedOn, setFedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [fedAt, setFedAt] = useState("");
  const [feedType, setFeedType] = useState("Hay");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("kg");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    if (!supabase) return;
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;

    const { error } = await supabase.from("feedings").insert({
      user_id: uid,
      fed_on: fedOn,
      fed_at: fedAt || null,
      feed_type: feedType,
      amount: amount ? Number(amount) : null,
      unit,
      notes: notes || null,
    });

    if (error) setMsg(error.message);
    else window.location.href = "/feedings";
  }

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Add feeding</h1>
          <Link className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" href="/feedings">
            Back
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div>
            <div className="text-sm font-semibold">Date</div>
            <input className="mt-1 w-full" type="date" value={fedOn} onChange={(e) => setFedOn(e.target.value)} />
          </div>
          <div>
            <div className="text-sm font-semibold">Time (optional)</div>
            <input className="mt-1 w-full" type="time" value={fedAt} onChange={(e) => setFedAt(e.target.value)} />
          </div>
          <div>
            <div className="text-sm font-semibold">Feed type</div>
            <input className="mt-1 w-full" value={feedType} onChange={(e) => setFeedType(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-semibold">Amount</div>
              <input className="mt-1 w-full" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50" />
            </div>
            <div>
              <div className="text-sm font-semibold">Unit</div>
              <select className="mt-1 w-full" value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option>kg</option>
                <option>lbs</option>
                <option>bales</option>
                <option>bags</option>
              </select>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold">Notes (optional)</div>
            <textarea className="mt-1 w-full" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <button className="w-full bg-green-700 text-white" onClick={save}>
            Save
          </button>
          {msg && <div className="text-sm text-red-700">{msg}</div>}
        </div>
      </div>
    </AuthGuard>
  );
}
