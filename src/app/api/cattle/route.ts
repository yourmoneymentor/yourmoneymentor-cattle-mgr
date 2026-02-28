import { z } from "zod";
import { json, badRequest, serverError } from "../_utils";
import { requireAdmin } from "@/lib/supabaseAdmin";

const CreateCow = z.object({
  tag: z.string().min(1),
  breed: z.string().optional(),
  sex: z.string().optional(),
  dob: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const { supabaseAdmin, ownerId } = requireAdmin();
    const { data, error } = await supabaseAdmin
      .from("cattle")
      .select("id,tag,breed,sex,dob,status,created_at")
      .eq("user_id", ownerId)
      .order("created_at", { ascending: false });
    if (error) return serverError(error.message);
    return json({ cattle: data ?? [] });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = CreateCow.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload");

    const { supabaseAdmin, ownerId } = requireAdmin();
    const { error } = await supabaseAdmin.from("cattle").insert({
      user_id: ownerId,
      tag: parsed.data.tag.trim(),
      breed: parsed.data.breed || null,
      sex: parsed.data.sex || "unknown",
      dob: parsed.data.dob || null,
      notes: parsed.data.notes || null,
      status: "active",
    });
    if (error) return serverError(error.message);
    return json({ ok: true });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}
