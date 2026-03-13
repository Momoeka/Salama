import { SignUpButton, Show } from "@clerk/nextjs";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
    ),
    title: "Share Your Moments",
    description: "Upload stunning images & videos. Build your visual story for the world to see.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    ),
    title: "AI-Powered Discovery",
    description: "Search by describing what you want. Our AI understands context, not just keywords.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    title: "Connect & Follow",
    description: "Follow creators you love. Like, comment, and build your creative community.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
    title: "24h Stories",
    description: "Share fleeting moments with stories that disappear after 24 hours. Stay authentic.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
    ),
    title: "Secure & Private",
    description: "Row-level security on every table. You control who sees your content.",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    ),
    title: "Support Creators",
    description: "Show love with direct donations. Support the art and artists you admire most.",
    color: "from-red-500 to-pink-600",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] rounded-full bg-purple-600/8 blur-[120px]" />
        <div className="absolute -right-[20%] top-[20%] h-[60vh] w-[60vh] rounded-full bg-pink-600/6 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[30%] h-[50vh] w-[50vh] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      {/* Hero */}
      <section className="relative px-4 pt-24 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:px-8">
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="animate-fade-in mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary/60 px-5 py-2 text-sm backdrop-blur-sm">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <span className="text-muted-foreground">Powered by AI</span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground">Open Source</span>
          </div>

          <h1 className="animate-slide-up mb-6 text-5xl font-black leading-[1.1] tracking-tight sm:text-7xl lg:text-8xl" style={{ animationDelay: "0.1s" }}>
            <span className="text-foreground">Welcome to </span>
            <span className="gradient-text">SALAMA</span>
          </h1>

          <p className="animate-slide-up mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
            The next-gen social platform for visual storytelling. Upload your moments,
            discover with AI-powered search, and connect with creators worldwide.
          </p>

          <div className="animate-slide-up flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]">
                  <span className="relative z-10">Get Started Free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/feed" className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]">
                <span className="relative z-10">Go to Feed</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </Show>
            <Link href="#features" className="rounded-2xl border border-border px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-secondary hover:border-muted-foreground/30 active:scale-[0.98]">
              See Features
            </Link>
          </div>
        </div>

        <div className="relative mx-auto mt-24 grid max-w-3xl grid-cols-3 gap-4">
          {[
            { value: "AI", label: "Semantic Search" },
            { value: "24h", label: "Stories" },
            { value: "E2E", label: "Encrypted" },
          ].map((stat) => (
            <div key={stat.label} className="group rounded-2xl border border-border bg-card/50 px-4 py-6 text-center backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card">
              <div className="mb-1 text-2xl font-bold text-primary sm:text-3xl">{stat.value}</div>
              <div className="text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-5xl">Everything You Need</h2>
            <p className="mx-auto max-w-xl text-muted-foreground">Built with cutting-edge tech to deliver a seamless, intelligent, and beautiful experience.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1">
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.color} p-3 text-white shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-border bg-card/30 p-8 backdrop-blur-sm sm:p-12">
            <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-primary">Built With</p>
            <h3 className="mb-8 text-center text-2xl font-bold text-foreground sm:text-3xl">Modern Tech Stack</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { name: "Next.js", desc: "Frontend" },
                { name: "Supabase", desc: "Database" },
                { name: "Clerk", desc: "Auth" },
                { name: "Pinecone", desc: "Vector DB" },
                { name: "OpenAI", desc: "AI/ML" },
                { name: "Resend", desc: "Emails" },
                { name: "Vercel", desc: "Hosting" },
                { name: "Tailwind", desc: "Styling" },
              ].map((tech) => (
                <div key={tech.name} className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-center transition-all hover:border-primary/30 hover:bg-secondary">
                  <div className="text-sm font-semibold text-foreground">{tech.name}</div>
                  <div className="text-xs text-muted-foreground">{tech.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-purple-600/10 via-card to-pink-600/10 p-12 text-center backdrop-blur-sm">
          <h2 className="relative mb-4 text-3xl font-bold text-foreground sm:text-4xl">Ready to Share Your World?</h2>
          <p className="relative mb-8 text-muted-foreground">Join SALAMA today and start your visual storytelling journey.</p>
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button className="relative rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]">
                Create Your Account
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/upload" className="inline-block rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]">
              Upload Your First Post
            </Link>
          </Show>
        </div>
      </section>
    </div>
  );
}
