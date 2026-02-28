"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/lib/supabase";

export default function NewCattle() {
  const [tag, setTag] = useState("");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState("unknown");
  const [dob, setDob] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    if (!supabase) return;
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;
    const { error } = await supabase.from("cattle").insert({
      user_id: uid,
      tag: tag.trim(),
      breed: breed || null,
      sex,
      dob: dob || null,
      notes: notes || null,
      status: "active",
    });
    if (error) setErr(error.message);
    else window.location.href = "/cattle";
  }

  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}
