import { z } from "zod";
import { json, badRequest, serverError } from "../../_utils";
import { requireAdmin } from "@/lib/supabaseAdmin";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  try {
    const { supabaseAdmin, ownerId } = requireAdmin();

    const { data: cow, error: cowErr } = await supabaseAdmin
      .from("cattle")
      .select("id,tag,breed,sex,dob,status,notes")
      .eq("user_id", ownerId)
      .eq("id", params.id)
      .maybeSingle();
    if (cowErr) return serverError(cowErr.message);

    const { data: weights } = await supabaseAdmin
      .from("weights")
      .select("weighed_on,weight_kg")
      .eq("user_id", ownerId)
      .eq("cattle_id", params.id)
      .order("weighed_on", { ascending: true });

    const { data: health } = await supabaseAdmin
      .from("health_events")
      .select("id,event_date,event_type,title,next_due_date")
      .eq("user_id", ownerId)
      .eq("cattle_id", params.id)
      .order("event_date", { ascending: false })
      .limit(50);

    return json({ cow: cow ?? null, weights: weights ?? [], health: health ?? [] });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}

const Update = z.object({ status: z.enum(["active", "sold", "deceased"]).optional() });

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  try {
    const body = await req.json().catch(() => null);
    const parsed = Update.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload");

    const { supabaseAdmin, ownerId } = requireAdmin();
    const { error } = await supabaseAdmin
      .from("cattle")
      .update(parsed.data)
      .eq("user_id", ownerId)
      .eq("id", params.id);
    if (error) return serverError(error.message);
    return json({ ok: true });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}
