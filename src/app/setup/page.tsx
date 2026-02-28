import { SetupNotice } from "@/components/SetupNotice";
import Link from "next/link";

export default function SetupPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Setup</h1>
      <SetupNotice />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Create a Supabase project.</li>
          <li>In Supabase → SQL Editor, run <code>supabase/schema.sql</code>.</li>
          <li>
            In Supabase → Auth, enable Email login (magic link is fine).
          </li>
          <li>
            In Vercel → Project → Settings → Environment Variables, set:
            <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs">
              NEXT_PUBLIC_SUPABASE_URL
              <br />NEXT_PUBLIC_SUPABASE_ANON_KEY
            </div>
          </li>
          <li>Redeploy.</li>
        </ol>
      </div>

      <Link className="inline-block rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold" href="/">
        Back
      </Link>
    </div>
  );
}
