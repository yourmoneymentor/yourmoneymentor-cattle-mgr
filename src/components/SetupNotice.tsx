export function SetupNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
      <div className="text-sm font-semibold">Setup needed</div>
      <div className="mt-1 text-sm">
        This app needs Supabase configured (env vars) before login/data will work.
      </div>
      <div className="mt-2 text-xs">
        Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        in Vercel → Project → Settings → Environment Variables.
      </div>
    </div>
  );
}
