"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";

// ==================== REPORT CONTENT ====================

export async function reportContent(
  targetType: "post" | "comment" | "profile" | "story",
  targetId: string,
  category: string,
  description?: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  const validCategories = ["spam", "abuse", "fake_account", "harassment", "other"];
  if (!validCategories.includes(category)) {
    throw new Error("Invalid report category");
  }

  const { error } = await supabaseAdmin.from("reports").insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    category,
    description: description?.trim() || null,
  });

  if (error) {
    console.error("Failed to create report:", error);
    throw new Error("Failed to submit report");
  }

  return { success: true };
}
