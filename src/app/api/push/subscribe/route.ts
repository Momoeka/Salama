import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getOrCreateUser();
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { endpoint, p256dh, auth: authKey } = await req.json();

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json(
      { error: "Missing subscription data" },
      { status: 400 }
    );
  }

  await supabaseAdmin.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth: authKey,
    },
    { onConflict: "user_id,endpoint" }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = await req.json();

  if (endpoint) {
    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint);
  }

  return NextResponse.json({ ok: true });
}
