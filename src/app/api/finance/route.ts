import { z } from "zod";
import { json, badRequest, serverError } from "../_utils";
import { requireAdmin } from "@/lib/supabaseAdmin";

const Create = z.object({
  trans_date: z.string().min(10),
  kind: z.enum(["cost", "income"]),
  category: z.string().min(1),
  amount: z.number(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const { supabaseAdmin, ownerId } = requireAdmin();
    const { data, error } = await supabaseAdmin
      .from("finance")
      .select("trans_date,kind,category,amount,notes")
      .eq("user_id", ownerId)
      .order("trans_date", { ascending: false })
      .limit(400);
    if (error) return serverError(error.message);
    return json({ finance: data ?? [] });
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
    const { error } = await supabaseAdmin.from("finance").insert({
      user_id: ownerId,
      trans_date: parsed.data.trans_date,
      kind: parsed.data.kind,
      category: parsed.data.category,
      amount: parsed.data.amount,
      notes: parsed.data.notes || null,
    });
    if (error) return serverError(error.message);
    return json({ ok: true });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}
