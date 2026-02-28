"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Cow = { id: string; tag: string; breed: string | null; status: string };

type WeightRow = { weighed_on: string; weight_kg: number };

type HealthRow = { id: string; event_date: string; event_type: string; title: string; next_due_date: string | null };

export default function CattleDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [cow, setCow] = useState<Cow | null>(null);
  const [weights, setWeights] = useState<WeightRow[]>([]);
  const [health, setHealth] = useState<HealthRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setErr(null);
      const res = await fetch(`/api/cattle/${id}`);
      const j = await res.json();
      if (!res.ok) {
        setErr(j?.error ?? "Failed to load");
        return;
      }
      setCow(j.cow);
      setWeights(j.weights ?? []);
      setHealth(j.health ?? []);
    }
    load();
  }, [id]);

  const readiness = useMemo(() => {
    const target = 550;
    if (weights.length < 2) return { msg: "Add at least 2 weights to estimate sale readiness.", eta: null as string | null };
    const a = weights[weights.length - 2];
    const b = weights[weights.length - 1];
    const days = (new Date(b.weighed_on).getTime() - new Date(a.weighed_on).getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 0) return { msg: "Weight dates need to be increasing.", eta: null };
    const gainPerDay = (b.weight_kg - a.weight_kg) / days;
    if (gainPerDay <= 0) return { msg: "No positive gain detected yet.", eta: null };
    const remaining = Math.max(0, target - b.weight_kg);
    const daysToTarget = remaining / gainPerDay;
    const base = new Date();
    const etaDate = new Date(base.getTime() + daysToTarget * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (b.weight_kg >= target) return { msg: `Likely ready (≥ ${target}kg).`, eta: etaDate };
    return { msg: `Est. ${gainPerDay.toFixed(2)} kg/day. Target ${target}kg.`, eta: etaDate };
  }, [weights]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{cow ? `Tag ${cow.tag}` : "Animal"}</h1>
          <div className="text-sm text-slate-600">{cow?.breed ?? "—"}</div>
        </div>
        <Link className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" href="/cattle">
          Back
        </Link>
      </div>

      {err && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Weights</div>
          <Link className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white" href={`/cattle/${id}/weights/new`}>
            + Weight
          </Link>
        </div>
        <div className="mt-2 text-sm text-slate-600">{readiness.msg}</div>
        {readiness.eta && <div className="mt-1 text-sm font-semibold">Est. ready by: {readiness.eta}</div>}

        <div className="mt-4 h-44">
          {weights.length === 0 ? (
            <div className="text-sm text-slate-600">No weights yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weights} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <XAxis dataKey="weighed_on" hide />
                <YAxis width={40} />
                <Tooltip />
                <Line type="monotone" dataKey="weight_kg" stroke="#15803d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Health & vaccinations</div>
          <Link className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white" href={`/cattle/${id}/health/new`}>
            + Log
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {health.map((h) => (
            <div key={h.id} className="rounded-xl bg-slate-50 p-3">
              <div className="flex justify-between">
                <div className="font-semibold">{h.title}</div>
                <div className="text-xs text-slate-500">{h.event_date}</div>
              </div>
              <div className="text-xs text-slate-500">{h.event_type}</div>
              {h.next_due_date && <div className="mt-1 text-xs font-semibold text-amber-800">Next due: {h.next_due_date}</div>}
            </div>
          ))}
          {health.length === 0 && <div className="text-sm text-slate-600">No health events logged.</div>}
        </div>
      </div>

      <Nav current="/cattle" />
    </div>
  );
}
