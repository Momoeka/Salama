import { createClient } from "@supabase/supabase-js";

// Untyped client for queries with joins/relations
// The typed client doesn't support .select("*, users:user_id(...)") well
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
