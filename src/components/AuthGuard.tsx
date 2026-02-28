"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SetupNotice } from "@/components/SetupNotice";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = "/login";
      else setReady(true);
    });
  }, []);

  if (!ready) return <div className="text-sm text-slate-600">Loading…</div>;
  if (!supabase) return <SetupNotice />;
  return <>{children}</>;
}
