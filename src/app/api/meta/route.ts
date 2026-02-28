import { json } from "../_utils";

export async function GET() {
  return json({
    ok: true,
    hasAdmin: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasOwnerId: Boolean(process.env.CATTLE_APP_OWNER_ID),
  });
}
