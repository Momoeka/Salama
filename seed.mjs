// seed.mjs — Run with: node --env-file=.env.local seed.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Bot Users ────────────────────────────────────────────────────────────────

const botUsers = [
  {
    clerk_id: "bot_1",
    username: "priya.lens",
    email: "priya.lens@example.com",
    avatar_url: "https://i.pravatar.cc/300?img=1",
    bio: "Street photographer from Mumbai. Chasing light and shadow through crowded lanes.",
  },
  {
    clerk_id: "bot_2",
    username: "marco_travels",
    email: "marco.travels@example.com",
    avatar_url: "https://i.pravatar.cc/300?img=2",
    bio: "Full-time wanderer. 47 countries and counting. Currently somewhere in Southeast Asia.",
  },
  {
    clerk_id: "bot_3",
    username: "aisha.eats",
    email: "aisha.eats@example.com",
    avatar_url: "https://i.pravatar.cc/300?img=3",
    bio: "Food stylist & home cook. If it looks good and tastes better, I'm posting it.",
  },
  {
    clerk_id: "bot_4",
    username: "kenji_urban",
    email: "kenji.urban@example.com",
    avatar_url: "https://i.pravatar.cc/300?img=4",
    bio: "Tokyo-based architect with a camera. Concrete, glass, and neon are my palette.",
  },
  {
    clerk_id: "bot_5",
    username: "elena.wild",
    email: "elena.wild@example.com",
    avatar_url: "https://i.pravatar.cc/300?img=5",
    bio: "Wildlife biologist. Documenting endangered species one photo at a time.",
  },
  {
    clerk_id: "bot_6",
    username: "omar.creates",
    email: "omar.creates@example.com",
    avatar_url: "https://i.pravatar.cc/300?img=6",
    bio: "Digital artist & photographer. Blending reality with imagination since 2019.",
  },
  {
    clerk_id: "bot_7",
    username: "sofia_golden",
    email: "sofia.golden@example.com",
    avatar_url: "https://i.pravatar.cc/300?img=7",
    bio: "Golden hour enthusiast. Portraits, landscapes, and everything in between.",
  },
  {
    clerk_id: "bot_8",
    username: "dev.rajan",
    email: "dev.rajan@example.com",
    avatar_url: "https://i.pravatar.cc/300?img=8",
    bio: "Weekend hiker, weekday coder. The mountains are my debugger.",
  },
];

// ── Posts ─────────────────────────────────────────────────────────────────────

const postTemplates = [
  {
    userIndex: 0,
    seed: "mumbai-rain-42",
    caption: "Monsoon light hitting the old bazaar just right. The kind of moment you can't plan for — you just have to be there.",
    tags: ["streetphotography", "mumbai", "monsoon", "light"],
    ai_description: "A rain-soaked street market in Mumbai with golden light reflecting off wet pavement. Vendors under colorful tarps, pedestrians with umbrellas.",
  },
  {
    userIndex: 0,
    seed: "chai-stall-77",
    caption: "Chai and conversations. Some of the best portraits happen when people forget the camera is there ☕",
    tags: ["portrait", "streetlife", "india", "chai"],
    ai_description: "Close-up of an elderly man holding a clay cup of tea at a roadside stall, warm tones, shallow depth of field.",
  },
  {
    userIndex: 0,
    seed: "mumbai-night-03",
    caption: "The city never sleeps. Neither do its stories.",
    tags: ["nightphotography", "mumbai", "urban", "longexposure"],
    ai_description: "Long exposure shot of Mumbai at night with streaking car lights along Marine Drive and city skyline in background.",
  },
  {
    userIndex: 1,
    seed: "bali-rice-99",
    caption: "Lost count of how many rice terraces I've stood in front of, and every single one still takes my breath away 🌾",
    tags: ["bali", "travel", "riceterrace", "indonesia"],
    ai_description: "Lush green rice terraces in Bali cascading down a hillside, early morning mist, palm trees in the distance.",
  },
  {
    userIndex: 1,
    seed: "vietnam-boat-55",
    caption: "Ha Long Bay at dawn. No filter. No exaggeration. Just... this.",
    tags: ["vietnam", "halongbay", "sunrise", "travel"],
    ai_description: "Traditional wooden junk boat floating on calm turquoise waters of Ha Long Bay, limestone karst formations in the background, sunrise colors.",
  },
  {
    userIndex: 1,
    seed: "nepal-hike-21",
    caption: "Day 12 on the Annapurna Circuit. My legs hate me but my eyes are grateful.",
    tags: ["nepal", "trekking", "himalayas", "adventure"],
    ai_description: "Dramatic Himalayan mountain vista with snow-capped peaks, prayer flags in foreground, bright blue sky.",
  },
  {
    userIndex: 2,
    seed: "pasta-fresh-88",
    caption: "Made fresh tagliatelle from scratch today. Three hours of work for fifteen minutes of pure bliss. Worth every second 🍝",
    tags: ["homemade", "pasta", "foodphotography", "italian"],
    ai_description: "Fresh handmade tagliatelle pasta arranged on a marble countertop dusted with flour, rustic kitchen setting.",
  },
  {
    userIndex: 2,
    seed: "spice-market-44",
    caption: "Spice shopping in Marrakech. My suitcase is going to smell incredible for months.",
    tags: ["morocco", "spices", "foodtravel", "color"],
    ai_description: "Vibrant display of colorful spices in conical mounds at a Moroccan market stall, warm ambient lighting.",
  },
  {
    userIndex: 2,
    seed: "dessert-art-67",
    caption: "When your dessert is too pretty to eat. (I ate it anyway.)",
    tags: ["dessert", "patisserie", "foodart", "yum"],
    ai_description: "Elegantly plated chocolate dessert with gold leaf, raspberry coulis, and edible flowers on a white ceramic plate.",
  },
  {
    userIndex: 3,
    seed: "tokyo-neon-11",
    caption: "Shinjuku at 2 AM is a different universe. Every surface is a screen, every alley a portal.",
    tags: ["tokyo", "neon", "nightlife", "cyberpunk"],
    ai_description: "Narrow Tokyo alleyway at night, dense with neon signs in Japanese, wet reflections on the ground, lone figure walking away.",
  },
  {
    userIndex: 3,
    seed: "concrete-form-33",
    caption: "Ando's Church of the Light. Architecture that makes you hold your breath.",
    tags: ["architecture", "tadaoando", "concrete", "minimalism"],
    ai_description: "Interior of Tadao Ando's Church of the Light showing the iconic cross-shaped opening in the concrete wall with dramatic light streaming through.",
  },
  {
    userIndex: 3,
    seed: "skyline-tokyo-90",
    caption: "Steel and glass reaching for something they'll never touch 🏙️",
    tags: ["cityscape", "skyscrapers", "modernarchitecture", "tokyo"],
    ai_description: "Upward perspective of clustered glass skyscrapers in Tokyo's Shiodome district against a cloudy sky, geometric patterns.",
  },
  {
    userIndex: 4,
    seed: "fox-snow-72",
    caption: "Spent 6 hours in a snow blind for this shot. The arctic fox showed up for exactly 90 seconds. This is why I do what I do.",
    tags: ["wildlife", "arcticfox", "nature", "conservation"],
    ai_description: "White arctic fox in a snowy landscape, alert and looking directly at the camera, snowflakes on its fur.",
  },
  {
    userIndex: 4,
    seed: "coral-reef-15",
    caption: "This reef was bleached five years ago. Look at it now. Nature heals when we let it 🐠",
    tags: ["ocean", "coralreef", "marinelife", "conservation"],
    ai_description: "Vibrant coral reef underwater scene with diverse tropical fish, healthy branching corals in blues, purples, and oranges.",
  },
  {
    userIndex: 4,
    seed: "eagle-flight-08",
    caption: "Wingspan. Freedom. Perspective.",
    tags: ["eagle", "birdphotography", "wildlife", "flight"],
    ai_description: "Bald eagle soaring with fully extended wings against a mountain backdrop, golden hour lighting catching wing feathers.",
  },
  {
    userIndex: 5,
    seed: "double-exposure-61",
    caption: "Double exposure experiment — the forest inside us 🌲 Created in-camera, no Photoshop",
    tags: ["doubleexposure", "creative", "portrait", "experimental"],
    ai_description: "Double exposure portrait merging a woman's profile silhouette with a dense pine forest, dreamy ethereal quality.",
  },
  {
    userIndex: 5,
    seed: "abstract-light-29",
    caption: "Playing with prisms and studio lights. Sometimes the best art comes from the simplest tools.",
    tags: ["abstract", "lightpainting", "creative", "studio"],
    ai_description: "Abstract photograph of rainbow light refractions from a prism against a dark background, vivid spectral colors.",
  },
  {
    userIndex: 6,
    seed: "golden-field-50",
    caption: "Drove two hours for this golden hour field session. My model fell asleep in the car on the way back. That's how you know it was a good shoot 😄",
    tags: ["goldenhour", "portrait", "nature", "warmtones"],
    ai_description: "Young woman standing in a golden wheat field at sunset, backlit by warm golden light, soft bokeh background.",
  },
  {
    userIndex: 6,
    seed: "lavender-dusk-84",
    caption: "Lavender fields in Provence. The smell is even better than the view, if you can believe that.",
    tags: ["provence", "lavender", "landscape", "france"],
    ai_description: "Expansive lavender field in Provence at dusk, purple rows stretching to the horizon, warm pink sky.",
  },
  {
    userIndex: 6,
    seed: "beach-silhouette-37",
    caption: "Some moments don't need color.",
    tags: ["blackandwhite", "silhouette", "beach", "minimal"],
    ai_description: "Black and white silhouette of a lone person walking along a beach shoreline, dramatic cloud formations overhead.",
  },
  {
    userIndex: 7,
    seed: "mountain-camp-46",
    caption: "Pitched the tent at 14,000 ft. Woke up above the clouds. No WiFi, no problems.",
    tags: ["camping", "mountains", "adventure", "altitude"],
    ai_description: "Small orange tent pitched on a rocky mountain ridge above a sea of clouds, sunrise painting the sky in pinks and oranges.",
  },
  {
    userIndex: 7,
    seed: "forest-trail-19",
    caption: "The trail less taken. Spoiler: it was worth it 🌿",
    tags: ["hiking", "forest", "trail", "nature"],
    ai_description: "Sunlit forest trail winding through tall pine trees, dappled light on the path, lush green undergrowth.",
  },
  {
    userIndex: 7,
    seed: "summit-dawn-63",
    caption: "5 AM summit push. -15°C. Fingers numb. Heart full. This is what living feels like.",
    tags: ["mountaineering", "summit", "sunrise", "adventure"],
    ai_description: "Climber standing on a narrow mountain summit at dawn, sweeping panoramic views of snow-covered peaks and valleys below.",
  },
];

// ── Comments ─────────────────────────────────────────────────────────────────

const commentPool = [
  "This is absolutely stunning! The composition is perfect.",
  "How do you always find these spots? 😍",
  "I need to visit this place ASAP",
  "The colors in this are unreal",
  "This just made my day. Incredible work.",
  "Teach me your ways 🙌",
  "I've been staring at this for five minutes straight",
  "Adding this to my bucket list right now",
  "The lighting here is *chef's kiss*",
  "This deserves way more recognition",
  "Wow, the detail in this shot is insane",
  "I can almost smell/feel/taste this through the screen",
  "Saving this for inspiration ✨",
  "You have such a unique eye for this kind of thing",
  "Been following you for a while — this might be your best yet",
  "Shot on what camera? The sharpness is wild",
  "The mood in this photo is everything",
  "Okay this is definitely print-worthy",
  "Love the story behind this one",
  "Absolutely breathtaking. No other words needed.",
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting seed...\n");

  // ── 1. Clean up previous bot data ──────────────────────────────────────────
  console.log("🧹 Cleaning up previous bot data...");
  const { data: existingBots } = await supabase
    .from("users")
    .select("id")
    .like("clerk_id", "bot_%");

  if (existingBots && existingBots.length > 0) {
    const botIds = existingBots.map((u) => u.id);
    // Delete in dependency order
    await supabase.from("notifications").delete().in("user_id", botIds);
    await supabase.from("notifications").delete().in("actor_id", botIds);
    await supabase.from("comments").delete().in("user_id", botIds);
    await supabase.from("likes").delete().in("user_id", botIds);
    await supabase.from("follows").delete().in("follower_id", botIds);
    await supabase.from("follows").delete().in("following_id", botIds);
    // Delete posts (cascades likes/comments on those posts too)
    await supabase.from("posts").delete().in("user_id", botIds);
    await supabase.from("users").delete().in("id", botIds);
    console.log(`   Removed ${botIds.length} old bot users and their data.\n`);
  }

  // ── 2. Insert users ───────────────────────────────────────────────────────
  console.log("👤 Creating bot users...");
  const { data: users, error: usersErr } = await supabase
    .from("users")
    .insert(botUsers)
    .select();

  if (usersErr) {
    console.error("Failed to insert users:", usersErr);
    process.exit(1);
  }
  console.log(`   Created ${users.length} users.\n`);

  // ── 3. Insert posts ───────────────────────────────────────────────────────
  console.log("📸 Creating posts...");
  const postsToInsert = postTemplates.map((tpl) => ({
    user_id: users[tpl.userIndex].id,
    image_url: `https://picsum.photos/seed/${tpl.seed}/800/800`,
    caption: tpl.caption,
    ai_description: tpl.ai_description,
    tags: tpl.tags,
    visibility: "public",
  }));

  const { data: posts, error: postsErr } = await supabase
    .from("posts")
    .insert(postsToInsert)
    .select();

  if (postsErr) {
    console.error("Failed to insert posts:", postsErr);
    process.exit(1);
  }
  console.log(`   Created ${posts.length} posts.\n`);

  // ── 4. Insert likes (30-40 random) ────────────────────────────────────────
  console.log("❤️  Adding likes...");
  const likeSet = new Set();
  const targetLikes = randInt(30, 40);

  while (likeSet.size < targetLikes) {
    const user = pick(users);
    const post = pick(posts);
    const key = `${user.id}|${post.id}`;
    if (!likeSet.has(key)) {
      likeSet.add(key);
    }
  }

  const likesToInsert = [...likeSet].map((key) => {
    const [user_id, post_id] = key.split("|");
    return { user_id, post_id };
  });

  const { data: likes, error: likesErr } = await supabase
    .from("likes")
    .insert(likesToInsert)
    .select();

  if (likesErr) {
    console.error("Failed to insert likes:", likesErr);
    process.exit(1);
  }
  console.log(`   Added ${likes.length} likes.\n`);

  // ── 5. Insert comments (15-20 random) ─────────────────────────────────────
  console.log("💬 Adding comments...");
  const targetComments = randInt(15, 20);
  const commentsToInsert = [];

  for (let i = 0; i < targetComments; i++) {
    const user = pick(users);
    const post = pick(posts);
    commentsToInsert.push({
      user_id: user.id,
      post_id: post.id,
      content: commentPool[i % commentPool.length],
    });
  }

  const { data: comments, error: commentsErr } = await supabase
    .from("comments")
    .insert(commentsToInsert)
    .select();

  if (commentsErr) {
    console.error("Failed to insert comments:", commentsErr);
    process.exit(1);
  }
  console.log(`   Added ${comments.length} comments.\n`);

  // ── 6. Insert follows (10-15 random) ──────────────────────────────────────
  console.log("🤝 Adding follows...");
  const followSet = new Set();
  const targetFollows = randInt(10, 15);

  while (followSet.size < targetFollows) {
    const follower = pick(users);
    const following = pick(users);
    if (follower.id !== following.id) {
      const key = `${follower.id}|${following.id}`;
      if (!followSet.has(key)) {
        followSet.add(key);
      }
    }
  }

  const followsToInsert = [...followSet].map((key) => {
    const [follower_id, following_id] = key.split("|");
    return { follower_id, following_id };
  });

  const { data: follows, error: followsErr } = await supabase
    .from("follows")
    .insert(followsToInsert)
    .select();

  if (followsErr) {
    console.error("Failed to insert follows:", followsErr);
    process.exit(1);
  }
  console.log(`   Added ${follows.length} follows.\n`);

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log("✅ Seed complete!");
  console.log(`   ${users.length} users`);
  console.log(`   ${posts.length} posts`);
  console.log(`   ${likes.length} likes`);
  console.log(`   ${comments.length} comments`);
  console.log(`   ${follows.length} follows`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
