import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q.trim()) {
    return NextResponse.json({ users: [] });
  }

  const currentUser = await getOrCreateUser();
  if (!currentUser) {
    return NextResponse.json({ users: [] });
  }

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, username, avatar_url")
    .ilike("username", `%${q}%`)
    .neq("id", currentUser.id)
    .limit(10);

  // Filter out blocked users
  const { data: blocks } = await supabaseAdmin
    .from("blocks")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${currentUser.id},blocked_id.eq.${currentUser.id}`);

  const blockedIds = new Set<string>();
  (blocks || []).forEach((b: any) => {
    if (b.blocker_id === currentUser.id) blockedIds.add(b.blocked_id);
    if (b.blocked_id === currentUser.id) blockedIds.add(b.blocker_id);
  });

  const filtered = (users || []).filter((u: any) => !blockedIds.has(u.id));

  return NextResponse.json({ users: filtered });
}
