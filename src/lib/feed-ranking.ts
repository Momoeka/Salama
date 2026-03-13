// AI-powered feed ranking algorithm
// Ranks posts based on engagement, recency, and user relevance

interface RankablePost {
  id: string;
  user_id: string;
  created_at: string;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  hasSaved: boolean;
}

interface UserInteraction {
  userId: string;
  score: number; // how much current user interacts with this poster
}

// Calculate engagement score (normalized 0-1)
function engagementScore(post: RankablePost): number {
  const likes = post.likeCount;
  const comments = post.commentCount;
  // Comments are weighted more (they require more effort)
  return Math.min((likes + comments * 3) / 50, 1);
}

// Calculate recency score (exponential decay)
function recencyScore(post: RankablePost): number {
  const now = Date.now();
  const postTime = new Date(post.created_at).getTime();
  const hoursAgo = (now - postTime) / (1000 * 60 * 60);
  // Half-life of 12 hours
  return Math.exp(-0.0578 * hoursAgo);
}

// Calculate relationship score based on past interactions
function relationshipScore(
  post: RankablePost,
  interactions: Map<string, number>
): number {
  return Math.min(interactions.get(post.user_id) || 0, 1);
}

// Calculate diversity penalty to avoid showing too many posts from same user
function diversityPenalty(
  post: RankablePost,
  seenUsers: Map<string, number>
): number {
  const count = seenUsers.get(post.user_id) || 0;
  return Math.pow(0.5, count); // Each additional post from same user gets 50% penalty
}

export function rankPosts(
  posts: RankablePost[],
  userInteractions: Map<string, number>
): RankablePost[] {
  // Score each post
  const scored = posts.map((post) => {
    const engagement = engagementScore(post);
    const recency = recencyScore(post);
    const relationship = relationshipScore(post, userInteractions);

    // Weighted combination
    const score =
      engagement * 0.3 + // 30% engagement
      recency * 0.35 + // 35% recency
      relationship * 0.25 + // 25% relationship
      (post.hasSaved ? 0.1 : 0); // 10% bonus if user saved similar content

    return { post, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Apply diversity penalty (re-sort considering same-user posts)
  const result: RankablePost[] = [];
  const seenUsers = new Map<string, number>();

  for (const { post, score } of scored) {
    const penalty = diversityPenalty(post, seenUsers);
    const finalScore = score * penalty;
    seenUsers.set(post.user_id, (seenUsers.get(post.user_id) || 0) + 1);
    result.push(post);
  }

  // Re-sort with diversity applied
  const finalScored = result.map((post, idx) => {
    const seenCount = new Map<string, number>();
    // Count how many times we've seen this user before this position
    for (let i = 0; i < idx; i++) {
      const uid = result[i].user_id;
      seenCount.set(uid, (seenCount.get(uid) || 0) + 1);
    }
    const engagement = engagementScore(post);
    const recency = recencyScore(post);
    const relationship = relationshipScore(post, userInteractions);
    const penalty = diversityPenalty(post, seenCount);

    const score =
      (engagement * 0.3 + recency * 0.35 + relationship * 0.25 + (post.hasSaved ? 0.1 : 0)) *
      penalty;

    return { post, score };
  });

  finalScored.sort((a, b) => b.score - a.score);
  return finalScored.map((s) => s.post);
}

// Build user interaction map from likes and comments the current user has made on other users' posts
export async function getUserInteractionScores(
  supabaseAdmin: any,
  userId: string
): Promise<Map<string, number>> {
  const interactions = new Map<string, number>();

  // Get posts the user has liked
  const { data: likedPosts } = await supabaseAdmin
    .from("likes")
    .select("post_id, posts:post_id(user_id)")
    .eq("user_id", userId)
    .limit(100);

  // Get posts the user has commented on
  const { data: commentedPosts } = await supabaseAdmin
    .from("comments")
    .select("post_id, posts:post_id(user_id)")
    .eq("user_id", userId)
    .limit(100);

  // Score: each like = 0.1, each comment = 0.2
  for (const like of likedPosts || []) {
    const postUserId = (like as any).posts?.user_id;
    if (postUserId && postUserId !== userId) {
      interactions.set(
        postUserId,
        (interactions.get(postUserId) || 0) + 0.1
      );
    }
  }

  for (const comment of commentedPosts || []) {
    const postUserId = (comment as any).posts?.user_id;
    if (postUserId && postUserId !== userId) {
      interactions.set(
        postUserId,
        (interactions.get(postUserId) || 0) + 0.2
      );
    }
  }

  // Get users the current user follows (bonus)
  const { data: following } = await supabaseAdmin
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  for (const follow of following || []) {
    const fid = (follow as any).following_id;
    interactions.set(fid, (interactions.get(fid) || 0) + 0.3);
  }

  return interactions;
}
