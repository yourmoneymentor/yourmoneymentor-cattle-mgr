import { z } from "zod";
import { json, badRequest, serverError } from "../_utils";
import { requireAdmin } from "@/lib/supabaseAdmin";

const Create = z.object({
  cattle_id: z.string().optional().nullable(),
  sold_on: z.string().min(10),
  buyer: z.string().optional(),
  sale_price: z.number(),
  weight_kg: z.number().optional().nullable(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const { supabaseAdmin, ownerId } = requireAdmin();
    const { data, error } = await supabaseAdmin
      .from("sales")
      .select("sold_on,sale_price,buyer,cattle_id")
      .eq("user_id", ownerId)
      .order("sold_on", { ascending: false })
      .limit(200);
    if (error) return serverError(error.message);
    return json({ sales: data ?? [] });
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

    const { error } = await supabaseAdmin.from("sales").insert({
      user_id: ownerId,
      cattle_id: parsed.data.cattle_id || null,
      sold_on: parsed.data.sold_on,
      buyer: parsed.data.buyer || null,
      sale_price: parsed.data.sale_price,
      weight_kg: parsed.data.weight_kg ?? null,
      notes: parsed.data.notes || null,
    });
    if (error) return serverError(error.message);

    if (parsed.data.cattle_id) {
      await supabaseAdmin
        .from("cattle")
        .update({ status: "sold" })
        .eq("user_id", ownerId)
        .eq("id", parsed.data.cattle_id);
    }

    await supabaseAdmin.from("finance").insert({
      user_id: ownerId,
      trans_date: parsed.data.sold_on,
      kind: "income",
      category: "sale",
      amount: parsed.data.sale_price,
      notes: parsed.data.buyer ? `Sale to ${parsed.data.buyer}` : "Sale",
    });

    return json({ ok: true });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}
