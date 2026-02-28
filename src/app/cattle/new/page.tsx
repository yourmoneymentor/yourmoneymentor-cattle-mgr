"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewCattle() {
  const [tag, setTag] = useState("");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState("unknown");
  const [dob, setDob] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    const res = await fetch("/api/cattle", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tag, breed, sex, dob, notes }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(j?.error ?? "Failed to save");
      return;
    }
    window.location.href = "/cattle";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Add animal</h1>
        <Link className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" href="/cattle">
          Back
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <div>
          <div className="text-sm font-semibold">Tag / Name</div>
          <input className="mt-1 w-full" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. 214" />
        </div>
        <div>
          <div className="text-sm font-semibold">Breed (optional)</div>
          <input className="mt-1 w-full" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="e.g. Angus" />
        </div>
        <div>
          <div className="text-sm font-semibold">Sex</div>
          <select className="mt-1 w-full" value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="unknown">Unknown</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <div className="text-sm font-semibold">DOB (optional)</div>
          <input className="mt-1 w-full" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
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
