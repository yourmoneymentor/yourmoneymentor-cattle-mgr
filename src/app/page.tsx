import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold text-slate-600">Cattle Manager</div>
        <h1 className="mt-1 text-2xl font-bold">Run a 50‑head herd from your phone</h1>
        <p className="mt-2 text-sm text-slate-600">
          Feeding logs, health/vaccinations, weights & growth, tasks, sales, and simple finance.
        </p>
        <div className="mt-4 flex gap-3">
          <Link className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white" href="/login">
            Log in
          </Link>
          <Link className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" href="/setup">
            Setup
          </Link>
        </div>
      </div>

      <div className="grid gap-3">
        {[
          ["Feeding", "Fast daily entries + reminders"],
          ["Health", "Vaccinations, treatments, next-due alerts"],
          ["Weights", "Charts + simple sale readiness estimate"],
          ["Sales/Finance", "Track sales and costs, see profit trend"],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="font-semibold">{t}</div>
            <div className="text-sm text-slate-600">{d}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
