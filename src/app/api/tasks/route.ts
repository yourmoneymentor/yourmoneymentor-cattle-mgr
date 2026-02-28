import { z } from "zod";
import { json, badRequest, serverError } from "../_utils";
import { requireAdmin } from "@/lib/supabaseAdmin";

const Create = z.object({ title: z.string().min(1), frequency: z.string().optional() });
const Toggle = z.object({ id: z.string().min(1), completed: z.boolean() });

export async function GET() {
  try {
    const { supabaseAdmin, ownerId } = requireAdmin();
    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select("id,title,frequency,completed,due_on")
      .eq("user_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return serverError(error.message);
    return json({ tasks: data ?? [] });
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
    const { error } = await supabaseAdmin.from("tasks").insert({
      user_id: ownerId,
      title: parsed.data.title.trim(),
      frequency: parsed.data.frequency || "daily",
    });
    if (error) return serverError(error.message);
    return json({ ok: true });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = Toggle.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload");

    const { supabaseAdmin, ownerId } = requireAdmin();
    const { error } = await supabaseAdmin
      .from("tasks")
      .update({ completed: parsed.data.completed, completed_at: parsed.data.completed ? new Date().toISOString() : null })
      .eq("user_id", ownerId)
      .eq("id", parsed.data.id);
    if (error) return serverError(error.message);
    return json({ ok: true });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}
