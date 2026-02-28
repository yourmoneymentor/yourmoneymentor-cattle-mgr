"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";

type Task = { id: string; title: string; frequency: string; completed: boolean; due_on: string | null };

export default function TasksPage() {
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState<Task[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const res = await fetch("/api/tasks");
    const j = await res.json();
    if (!res.ok) {
      setErr(j?.error ?? "Failed to load tasks");
      return;
    }
    setRows((j.tasks ?? []) as Task[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: title.trim(), frequency: "daily" }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(j?.error ?? "Failed to add");
      return;
    }
    setTitle("");
    load();
  }

  async function toggle(t: Task) {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: t.id, completed: !t.completed }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(j?.error ?? "Failed to update");
      return;
    }
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Tasks</h1>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div>}

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
  );
}
