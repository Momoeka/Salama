import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sendPushNotification } from "@/lib/send-notification";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, title, body, url } = await req.json();

  if (!userId || !title) {
    return NextResponse.json(
      { error: "userId and title are required" },
      { status: 400 }
    );
  }

  await sendPushNotification(userId, { title, body, url });
  return NextResponse.json({ ok: true });
}
