"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function NewHealthEvent() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("vaccination");
  const [title, setTitle] = useState("Vaccination");
  const [product, setProduct] = useState("");
  const [dose, setDose] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    const res = await fetch("/api/health", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cattle_id: id,
        event_date: date,
        event_type: type,
        title,
        product,
        dose,
        next_due_date: nextDue || undefined,
        notes,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(j?.error ?? "Failed to save");
      return;
    }
    window.location.href = `/cattle/${id}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Log health event</h1>
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
          <div className="text-sm font-semibold">Type</div>
          <select className="mt-1 w-full" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="vaccination">Vaccination</option>
            <option value="treatment">Treatment</option>
            <option value="check">Check</option>
          </select>
        </div>
        <div>
          <div className="text-sm font-semibold">Title</div>
          <input className="mt-1 w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 7-in-1" />
        </div>
        <div>
          <div className="text-sm font-semibold">Product (optional)</div>
          <input className="mt-1 w-full" value={product} onChange={(e) => setProduct(e.target.value)} />
        </div>
        <div>
          <div className="text-sm font-semibold">Dose (optional)</div>
          <input className="mt-1 w-full" value={dose} onChange={(e) => setDose(e.target.value)} />
        </div>
        <div>
          <div className="text-sm font-semibold">Next due date (optional)</div>
          <input className="mt-1 w-full" type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
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
