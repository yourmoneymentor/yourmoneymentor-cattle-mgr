"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Nav } from "@/components/Nav";
import { supabase } from "@/lib/supabase";

type Cow = { id: string; tag: string; breed: string | null; status: string; dob: string | null };

export default function CattleList() {
  const [rows, setRows] = useState<Cow[]>([]);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const { data } = await supabase
        .from("cattle")
        .select("id,tag,breed,status,dob")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      setRows((data ?? []) as Cow[]);
    }
    load();
  }, []);

  return (
    <AuthGuard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Cattle</h1>
          <Link className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white" href="/cattle/new">
            + Add
          </Link>
        </div>

        <div className="space-y-2">
          {rows.map((c) => (
            <Link key={c.id} href={`/cattle/${c.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex justify-between">
                <div className="font-semibold">Tag: {c.tag}</div>
                <div className="text-xs rounded-full bg-slate-100 px-2 py-1">{c.status}</div>
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {c.breed ?? "—"} {c.dob ? `• DOB ${c.dob}` : ""}
              </div>
            </Link>
          ))}
          {rows.length === 0 && <div className="text-sm text-slate-600">No cattle yet. Add your first animal.</div>}
        </div>

        <Nav current="/cattle" />
      </div>
    </AuthGuard>
  );
}
