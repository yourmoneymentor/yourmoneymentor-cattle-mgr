import { z } from "zod";
import { json, badRequest, serverError } from "../_utils";
import { requireAdmin } from "@/lib/supabaseAdmin";

const Create = z.object({
  cattle_id: z.string().min(1),
  event_date: z.string().min(10),
  event_type: z.string().min(1),
  title: z.string().min(1),
  product: z.string().optional(),
  dose: z.string().optional(),
  next_due_date: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = Create.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload");

    const { supabaseAdmin, ownerId } = requireAdmin();
    const { error } = await supabaseAdmin.from("health_events").insert({
      user_id: ownerId,
      cattle_id: parsed.data.cattle_id,
      event_date: parsed.data.event_date,
      event_type: parsed.data.event_type,
      title: parsed.data.title,
      product: parsed.data.product || null,
      dose: parsed.data.dose || null,
      next_due_date: parsed.data.next_due_date || null,
      notes: parsed.data.notes || null,
    });
    if (error) return serverError(error.message);
    return json({ ok: true });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}
