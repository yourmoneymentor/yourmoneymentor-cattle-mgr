"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";

export default function NewWeight() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    if (!supabase) return;
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;

    const { error } = await supabase.from("weights").insert({
      user_id: uid,
      cattle_id: id,
      weighed_on: date,
      weight_kg: Number(weight),
      notes: notes || null,
    });

    if (error) setErr(error.message);
    else window.location.href = `/cattle/${id}`;
  }

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Add weight</h1>
          <Link className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" href={`/cattle/${id}`}>
            Back
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <div>
            <div className="text-sm font-semibold">Date</div>
            <input className="mt-1 w-full" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <div className="text-sm font-semibold">Weight (kg)</div>
            <input className="mt-1 w-full" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 420" />
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
