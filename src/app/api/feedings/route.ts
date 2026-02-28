import { z } from "zod";
import { json, badRequest, serverError } from "../_utils";
import { requireAdmin } from "@/lib/supabaseAdmin";

const Create = z.object({
  fed_on: z.string().min(10),
  fed_at: z.string().optional(),
  feed_type: z.string().min(1),
  amount: z.number().optional().nullable(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const { supabaseAdmin, ownerId } = requireAdmin();
    const { data, error } = await supabaseAdmin
      .from("feedings")
      .select("id,fed_on,fed_at,feed_type,amount,unit")
      .eq("user_id", ownerId)
      .order("fed_on", { ascending: false })
      .limit(100);
    if (error) return serverError(error.message);
    return json({ feedings: data ?? [] });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = Create.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload");

    const { supabaseAdmin, ownerId } = requireAdmin();
    const { error } = await supabaseAdmin.from("feedings").insert({
      user_id: ownerId,
      fed_on: parsed.data.fed_on,
      fed_at: parsed.data.fed_at || null,
      feed_type: parsed.data.feed_type,
      amount: parsed.data.amount ?? null,
      unit: parsed.data.unit || "kg",
      notes: parsed.data.notes || null,
    });
    if (error) return serverError(error.message);
    return json({ ok: true });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}
