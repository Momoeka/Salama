"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";

export async function createPoll(
  postId: string,
  question: string,
  options: string[]
) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");

  if (!question.trim()) throw new Error("Question is required");
  if (options.length < 2 || options.length > 4)
    throw new Error("Poll must have 2-4 options");

  const { data: poll, error: pollError } = await supabaseAdmin
    .from("polls")
    .insert({ post_id: postId, question: question.trim() })
    .select("id")
    .single();

  if (pollError || !poll) {
    console.error("Poll creation error:", pollError);
    throw new Error("Failed to create poll");
  }

  const optionRows = options.map((text, index) => ({
    poll_id: poll.id,
    text: text.trim(),
    position: index,
  }));

  const { error: optionsError } = await supabaseAdmin
    .from("poll_options")
    .insert(optionRows);

  if (optionsError) {
    console.error("Poll options error:", optionsError);
    throw new Error("Failed to create poll options");
  }

  return poll.id;
}

export async function votePoll(pollId: string, optionId: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabaseAdmin.from("poll_votes").insert({
    poll_id: pollId,
    option_id: optionId,
    user_id: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("You have already voted on this poll");
    }
    console.error("Vote error:", error);
    throw new Error("Failed to vote");
  }
}

export interface PollData {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    position: number;
    voteCount: number;
  }[];
  totalVotes: number;
  userVoteOptionId: string | null;
}

export async function getPollForPost(
  postId: string
): Promise<PollData | null> {
  const user = await getOrCreateUser();

  const { data: poll } = await supabaseAdmin
    .from("polls")
    .select("id, question")
    .eq("post_id", postId)
    .maybeSingle();

  if (!poll) return null;

  const { data: options } = await supabaseAdmin
    .from("poll_options")
    .select("id, text, position")
    .eq("poll_id", poll.id)
    .order("position", { ascending: true });

  if (!options || options.length === 0) return null;

  // Get vote counts per option
  const voteCounts = await Promise.all(
    options.map(async (opt) => {
      const { count } = await supabaseAdmin
        .from("poll_votes")
        .select("*", { count: "exact", head: true })
        .eq("poll_id", poll.id)
        .eq("option_id", opt.id);
      return { optionId: opt.id, count: count || 0 };
    })
  );

  // Get current user's vote
  let userVoteOptionId: string | null = null;
  if (user) {
    const { data: userVote } = await supabaseAdmin
      .from("poll_votes")
      .select("option_id")
      .eq("poll_id", poll.id)
      .eq("user_id", user.id)
      .maybeSingle();
    userVoteOptionId = userVote?.option_id || null;
  }

  const totalVotes = voteCounts.reduce((sum, vc) => sum + vc.count, 0);

  return {
    id: poll.id,
    question: poll.question,
    options: options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      position: opt.position,
      voteCount:
        voteCounts.find((vc) => vc.optionId === opt.id)?.count || 0,
    })),
    totalVotes,
    userVoteOptionId,
  };
}

export async function getUserVote(
  pollId: string
): Promise<string | null> {
  const user = await getOrCreateUser();
  if (!user) return null;

  const { data } = await supabaseAdmin
    .from("poll_votes")
    .select("option_id")
    .eq("poll_id", pollId)
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.option_id || null;
}
