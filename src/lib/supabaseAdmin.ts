import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const OWNER_ID = process.env.CATTLE_APP_OWNER_ID;

export const supabaseAdmin = url && service ? createClient(url, service) : null;

export function requireAdmin() {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase admin is not configured. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  if (!OWNER_ID) {
    throw new Error("Missing CATTLE_APP_OWNER_ID env var.");
  }
  return { supabaseAdmin, ownerId: OWNER_ID };
}
