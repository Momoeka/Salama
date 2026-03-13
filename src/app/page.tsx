import { SignUpButton, Show } from "@clerk/nextjs";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
    ),
    title: "Share Your Moments",
    description: "Upload and share stunning images with a global community. Your gallery, your story.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="m6 20 .7-2"/><path d="M17.3 20 18 18"/></svg>
    ),
    title: "AI-Powered Discovery",
    description: "Search images by describing what you want. Our AI understands context, not just keywords.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    title: "Connect & Follow",
    description: "Follow creators you love. Like, comment, and build a community around visual storytelling.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
    ),
    title: "Secure & Private",
    description: "Your data is encrypted and protected. Control who sees your content with privacy settings.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    ),
    title: "Smart Auto-Tags",
    description: "AI automatically generates tags and descriptions for your uploads. Less work, more reach.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    ),
    title: "Support Creators",
    description: "Show love to your favorite creators with direct donations. Support the art you admire.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        {/* Background gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Powered by AI
          </div>

          <h1
            className="animate-slide-up mb-6 text-5xl font-extrabold leading-tight tracking-tight text-foreground sm:text-7xl"
            style={{ animationDelay: "0.1s" }}
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              SALAMA
            </span>
          </h1>

          <p
            className="animate-slide-up mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl"
            style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
          >
            A next-gen image gallery and social platform. Upload your moments,
            discover with AI-powered search, and connect with creators
            worldwide.
          </p>

          <div
            className="animate-slide-up flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
          >
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="animate-pulse-glow rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-accent hover:scale-105">
                  Get Started — It&apos;s Free
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/feed"
                className="animate-pulse-glow rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-accent hover:scale-105"
              >
                Go to Feed
              </Link>
            </Show>
            <Link
              href="#features"
              className="rounded-xl border border-border px-8 py-3.5 text-base font-semibold text-foreground transition-all hover:bg-secondary"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="relative mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-8 text-center">
          {[
            { value: "AI", label: "Powered Search" },
            { value: "E2E", label: "Encrypted" },
            { value: "100%", label: "Free to Start" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-primary sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Built with cutting-edge tech to deliver a seamless, intelligent,
              and beautiful experience.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Ready to Share Your World?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Join SALAMA today and start sharing your visual stories with the
            world.
          </p>
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-accent hover:scale-105">
                Create Your Account
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/upload"
              className="inline-block rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-all hover:bg-accent hover:scale-105"
            >
              Upload Your First Image
            </Link>
          </Show>
        </div>
      </section>
    </div>
  );
}
