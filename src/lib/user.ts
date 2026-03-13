import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase-admin";
import { sendWelcomeEmail } from "./email";

export interface AppUser {
  id: string;
  clerk_id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get the Supabase user for the currently signed-in Clerk user.
 * If the user doesn't exist in Supabase yet, creates them.
 */
export async function getOrCreateUser(): Promise<AppUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  // Check if user already exists in Supabase
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (existingUser) return existingUser as AppUser;

  // User doesn't exist yet — create from Clerk data
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const username =
    clerkUser.username ||
    `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
    "User";

  const { data: newUser, error } = await supabaseAdmin
    .from("users")
    .upsert(
      {
        clerk_id: userId,
        username,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        avatar_url: clerkUser.imageUrl || null,
      },
      { onConflict: "clerk_id" }
    )
    .select()
    .single();

  if (!error && newUser) {
    // Send welcome email (non-blocking)
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (email) {
      sendWelcomeEmail(email, username).catch(() => {});
    }
  }

  if (error) {
    console.error("Failed to create user in Supabase:", error);
    // If upsert failed, try fetching again (race condition)
    const { data: retryUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();
    return retryUser as AppUser | null;
  }

  return newUser as AppUser;
}
