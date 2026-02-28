import { json, serverError } from "../_utils";
import { requireAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { supabaseAdmin, ownerId } = requireAdmin();
    const today = new Date().toISOString().slice(0, 10);

    const { data: health } = await supabaseAdmin
      .from("health_events")
      .select("title,next_due_date,cattle_id")
      .eq("user_id", ownerId)
      .not("next_due_date", "is", null)
      .lte("next_due_date", today)
      .order("next_due_date", { ascending: true })
      .limit(10);

    const { data: tasks } = await supabaseAdmin
      .from("tasks")
      .select("id,title,due_on")
      .eq("user_id", ownerId)
      .eq("completed", false)
      .or(`due_on.is.null,due_on.lte.${today}`)
      .limit(10);

    return json({
      health: health ?? [],
      tasks: tasks ?? [],
      today,
    });
  } catch (e: any) {
    return serverError(e.message ?? "Server error");
  }
}
