"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Nav } from "@/components/Nav";
import { supabase } from "@/lib/supabase";
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

  async function load() {
    if (!supabase) return;
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;
    const { data } = await supabase
      .from("finance")
      .select("trans_date,kind,category,amount,notes")
      .eq("user_id", uid)
      .order("trans_date", { ascending: false })
      .limit(200);
    setRows((data ?? []) as Row[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!supabase || !amount) return;
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;
    await supabase.from("finance").insert({
      user_id: uid,
      trans_date: date,
      kind,
      category,
      amount: Number(amount),
      notes: notes || null,
    });
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

  const profitTotal = useMemo(() => rows.reduce((acc, r) => acc + (r.kind === "income" ? r.amount : -r.amount), 0), [rows]);

  return (
    <AuthGuard>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Finance</h1>

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

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-sm font-semibold">Recent</div>
          <div className="mt-3 space-y-2">
            {rows.slice(0, 20).map((r, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <div>
                  <div className="font-semibold">{r.category}</div>
                  <div className="text-xs text-slate-500">{r.trans_date}</div>
                </div>
                <div className={r.kind === "income" ? "font-bold text-green-700" : "font-bold text-red-700"}>
                  {r.kind === "income" ? "+" : "-"}
                  {r.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Nav current="/finance" />
      </div>
    </AuthGuard>
  );
}
