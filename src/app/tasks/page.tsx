"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Nav } from "@/components/Nav";
import { supabase } from "@/lib/supabase";

type Task = { id: string; title: string; frequency: string; completed: boolean; due_on: string | null };

export default function TasksPage() {
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState<Task[]>([]);

  async function load() {
    if (!supabase) return;
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;
    const { data } = await supabase
      .from("tasks")
      .select("id,title,frequency,completed,due_on")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(100);
    setRows((data ?? []) as Task[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!supabase || !title.trim()) return;
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;
    await supabase.from("tasks").insert({ user_id: uid, title: title.trim(), frequency: "daily" });
    setTitle("");
    load();
  }

  async function toggle(t: Task) {
    if (!supabase) return;
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;
    await supabase
      .from("tasks")
      .update({ completed: !t.completed, completed_at: !t.completed ? new Date().toISOString() : null })
      .eq("id", t.id)
      .eq("user_id", uid);
    load();
  }

  return (
    <AuthGuard>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Tasks</h1>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex gap-2">
            <input className="w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task (e.g. Check water troughs)" />
            <button className="bg-green-700 text-white" onClick={add}>
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {rows.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-slate-500">{t.frequency}</div>
              </div>
              <button className={t.completed ? "bg-slate-100" : "bg-green-100 text-green-900"} onClick={() => toggle(t)}>
                {t.completed ? "Done" : "Mark done"}
              </button>
            </div>
          ))}
          {rows.length === 0 && <div className="text-sm text-slate-600">No tasks yet.</div>}
        </div>

        <Nav current="/tasks" />
      </div>
    </AuthGuard>
  );
}
