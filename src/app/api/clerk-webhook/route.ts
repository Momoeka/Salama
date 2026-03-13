import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use untyped client here since webhook data comes from Clerk (external)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "user.created") {
      const { id, email_addresses, username, first_name, last_name, image_url } = data;
      const email = email_addresses?.[0]?.email_address;
      const name = username || `${first_name || ""} ${last_name || ""}`.trim() || "User";

      await supabase.from("users").upsert(
        {
          clerk_id: id,
          username: name,
          email: email,
          avatar_url: image_url || null,
        },
        { onConflict: "clerk_id" }
      );
    }

    if (type === "user.updated") {
      const { id, email_addresses, username, first_name, last_name, image_url } = data;
      const email = email_addresses?.[0]?.email_address;
      const name = username || `${first_name || ""} ${last_name || ""}`.trim();

      await supabase
        .from("users")
        .update({
          username: name,
          email: email,
          avatar_url: image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_id", id);
    }

    if (type === "user.deleted") {
      await supabase.from("users").delete().eq("clerk_id", data.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
