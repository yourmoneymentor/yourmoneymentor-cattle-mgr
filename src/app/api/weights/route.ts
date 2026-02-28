import { z } from "zod";
import { json, badRequest, serverError } from "../_utils";
import { requireAdmin } from "@/lib/supabaseAdmin";

const Create = z.object({
  cattle_id: z.string().min(1),
  weighed_on: z.string().min(10),
  weight_kg: z.number(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = Create.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload");

    const { supabaseAdmin, ownerId } = requireAdmin();
    const { error } = await supabaseAdmin.from("weights").insert({
      user_id: ownerId,
      cattle_id: parsed.data.cattle_id,
      weighed_on: parsed.data.weighed_on,
      weight_kg: parsed.data.weight_kg,
      notes: parsed.data.notes || null,
    });
    if (error) return serverError(error.message);
    return json({ ok: true });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}
