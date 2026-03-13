"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

export async function createCollection(name: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabaseAdmin
    .from("collections")
    .insert({ user_id: user.id, name })
    .select("id")
    .single();

  if (error) throw new Error("Failed to create collection");
  revalidatePath("/profile");
  return data;
}

export async function deleteCollection(collectionId: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");

  await supabaseAdmin
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", user.id);

  revalidatePath("/profile");
}

export async function addToCollection(collectionId: string, postId: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");

  // Verify collection belongs to user
  const { data: collection } = await supabaseAdmin
    .from("collections")
    .select("id")
    .eq("id", collectionId)
    .eq("user_id", user.id)
    .single();

  if (!collection) throw new Error("Collection not found");

  await supabaseAdmin
    .from("collection_posts")
    .upsert({ collection_id: collectionId, post_id: postId });

  // Update cover image to latest post
  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("image_url")
    .eq("id", postId)
    .single();

  if (post) {
    await supabaseAdmin
      .from("collections")
      .update({ cover_image: post.image_url })
      .eq("id", collectionId);
  }
}

export async function removeFromCollection(collectionId: string, postId: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");

  await supabaseAdmin
    .from("collection_posts")
    .delete()
    .eq("collection_id", collectionId)
    .eq("post_id", postId);
}

export async function getCollections(userId?: string) {
  const user = userId ? { id: userId } : await getOrCreateUser();
  if (!user) return [];

  const { data: collections } = await supabaseAdmin
    .from("collections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!collections) return [];

  // Get post counts and cover images for each collection
  return Promise.all(
    collections.map(async (c: any) => {
      const { count } = await supabaseAdmin
        .from("collection_posts")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", c.id);

      const { data: coverPosts } = await supabaseAdmin
        .from("collection_posts")
        .select("post_id, posts:post_id (image_url)")
        .eq("collection_id", c.id)
        .order("added_at", { ascending: false })
        .limit(4);

      return {
        id: c.id,
        name: c.name,
        postCount: count || 0,
        coverImages: (coverPosts || []).map((cp: any) => cp.posts?.image_url).filter(Boolean),
        created_at: c.created_at,
      };
    })
  );
}

export async function getCollectionPosts(collectionId: string) {
  const { data } = await supabaseAdmin
    .from("collection_posts")
    .select("post_id, added_at, posts:post_id (*, users:user_id (id, username, avatar_url))")
    .eq("collection_id", collectionId)
    .order("added_at", { ascending: false });

  return (data || []).map((cp: any) => cp.posts).filter(Boolean);
}
