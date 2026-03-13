import { auth, currentUser } from "@clerk/nextjs/server";
import { getStreamServerClient } from "@/lib/stream";
import { getOrCreateUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const client = getStreamServerClient();

    // Upsert user in Stream
    await client.upsertUser({
      id: user.id,
      name: user.username,
      image: user.avatar_url || undefined,
    });

    // Generate token
    const token = client.createToken(user.id);

    return NextResponse.json({
      token,
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatar_url,
    });
  } catch (error) {
    console.error("Stream token error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
