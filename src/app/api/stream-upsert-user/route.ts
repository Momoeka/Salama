import { auth } from "@clerk/nextjs/server";
import { getStreamServerClient } from "@/lib/stream";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, image } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: "Missing id or name" }, { status: 400 });
    }

    const client = getStreamServerClient();
    await client.upsertUser({
      id,
      name,
      image: image || undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Stream upsert user error:", error);
    return NextResponse.json({ error: "Failed to upsert user" }, { status: 500 });
  }
}
