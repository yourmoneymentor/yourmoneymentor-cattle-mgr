"use client";

import { useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Row = { trans_date: string; kind: "cost" | "income"; category: string; amount: number; notes: string | null };

type TrendPoint = { month: string; profit: number };

export default function FinancePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [kind, setKind] = useState<Row["kind"]>("cost");
  const [category, setCategory] = useState("feed");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const res = await fetch("/api/finance");
    const j = await res.json();
    if (!res.ok) {
      setErr(j?.error ?? "Failed to load finance");
      return;
    }
    setRows((j.finance ?? []) as Row[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!amount) return;
    const res = await fetch("/api/finance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        trans_date: date,
        kind,
        category,
        amount: Number(amount),
        notes,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(j?.error ?? "Failed to add");
      return;
    }
    setAmount("");
    setNotes("");
    load();
  }

  const trend = useMemo(() => {
    const byMonth = new Map<string, number>();
    rows.forEach((r) => {
      const month = r.trans_date.slice(0, 7);
      const delta = r.kind === "income" ? r.amount : -r.amount;
      byMonth.set(month, (byMonth.get(month) ?? 0) + delta);
    });
    const pts: TrendPoint[] = [...byMonth.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, profit]) => ({ month, profit }));
    return pts;
  }, [rows]);

  const profitTotal = useMemo(
    () => rows.reduce((acc, r) => acc + (r.kind === "income" ? r.amount : -r.amount), 0),
    [rows]
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Finance</h1>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">Profit / loss (approx)</div>
        <div className="mt-1 text-3xl font-bold" style={{ color: profitTotal >= 0 ? "#15803d" : "#b91c1c" }}>
          {profitTotal.toFixed(0)}
        </div>
        <div className="mt-3 h-40">
          {trend.length === 0 ? (
            <div className="text-sm text-slate-600">No finance entries yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <XAxis dataKey="month" hide />
                <YAxis width={50} />
                <Tooltip />
                <Line type="monotone" dataKey="profit" stroke="#0f172a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-semibold">Date</div>
            <input className="mt-1 w-full" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <div className="text-sm font-semibold">Kind</div>
            <select className="mt-1 w-full" value={kind} onChange={(e) => setKind(e.target.value as Row["kind"])}>
              <option value="cost">Cost</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-semibold">Category</div>
            <select className="mt-1 w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="feed">Feed</option>
              <option value="vet">Vet</option>
              <option value="fuel">Fuel</option>
              <option value="sale">Sale</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <div className="text-sm font-semibold">Amount</div>
            <input className="mt-1 w-full" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120" />
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">Notes (optional)</div>
          <input className="mt-1 w-full" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button className="w-full bg-green-700 text-white" onClick={add}>
          Add entry
        </button>
      </div>

      <Nav current="/finance" />
    </div>
  );
}
