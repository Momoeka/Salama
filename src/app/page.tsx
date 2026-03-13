import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/feed");

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4">
      {/* Soft ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] h-[40vh] w-[40vh] rounded-full bg-[var(--gradient-start)]/[0.06] blur-[140px]" />
        <div className="absolute right-[10%] bottom-[15%] h-[35vh] w-[35vh] rounded-full bg-[var(--gradient-end)]/[0.05] blur-[120px]" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">
        {/* Logo mark */}
        <div className="animate-fade-in">
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-[56px] w-[56px] sm:h-[72px] sm:w-[72px]"
          >
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--gradient-start)" />
                <stop offset="100%" stopColor="var(--gradient-end)" />
              </linearGradient>
            </defs>
            {/* Shield / crest shape */}
            <path
              d="M36 4C36 4 8 14 8 32C8 50 24 66 36 68C48 66 64 50 64 32C64 14 36 4 36 4Z"
              fill="url(#logoGrad)"
              opacity="0.12"
            />
            <path
              d="M36 4C36 4 8 14 8 32C8 50 24 66 36 68C48 66 64 50 64 32C64 14 36 4 36 4Z"
              stroke="url(#logoGrad)"
              strokeWidth="2"
              fill="none"
            />
            {/* Inner S letterform */}
            <path
              d="M42 26C42 22.7 39.3 20 36 20C32.7 20 30 22.7 30 26C30 29.3 32.7 32 36 32C39.3 32 42 34.7 42 38C42 41.3 39.3 44 36 44C32.7 44 30 41.3 30 38"
              stroke="url(#logoGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Small rising accent */}
            <circle cx="36" cy="14" r="2" fill="url(#logoGrad)" opacity="0.6" />
          </svg>
        </div>

        {/* Brand name */}
        <h1 className="animate-slide-up text-5xl font-black tracking-[0.2em] sm:text-6xl">
          <span className="gradient-text">SALAMA</span>
        </h1>

        {/* Tagline */}
        <p
          className="animate-slide-up text-base text-muted-foreground sm:text-lg"
          style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
        >
          Share your world.
        </p>

        {/* Buttons */}
        <div
          className="animate-slide-up flex items-center gap-3 pt-2"
          style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
        >
          <SignInButton mode="modal">
            <button className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-secondary hover:border-muted-foreground/30 active:scale-[0.97]">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.97]">
              Get Started
            </button>
          </SignUpButton>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground/50">
        Powered by AI
      </p>
    </div>
  );
}
