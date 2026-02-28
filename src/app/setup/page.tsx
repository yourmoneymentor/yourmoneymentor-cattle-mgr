export default function SetupPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Setup</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
        <div className="font-semibold">Supabase</div>
        <ol className="mt-2 list-decimal space-y-2 pl-5">
          <li>Create a Supabase project.</li>
          <li>In Supabase → SQL Editor, run <code>supabase/schema.sql</code>.</li>
          <li>
            In Vercel → Project → Settings → Environment Variables, set:
            <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs">
              SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
              <br />SUPABASE_SERVICE_ROLE_KEY
              <br />CATTLE_APP_OWNER_ID (a UUID)
            </div>
          </li>
        </ol>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
        <div className="font-semibold">Health reminders</div>
        <div className="mt-2 text-sm text-slate-600">
          The Dashboard highlights due items (based on “Next due date”). Push notifications can be added later.
        </div>
      </div>
    </div>
  );
}
