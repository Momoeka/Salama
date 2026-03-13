import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/feed");

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[15%] left-[20%] h-[45vh] w-[45vh] rounded-full bg-purple-600/[0.07] blur-[140px]" />
        <div className="absolute right-[15%] bottom-[20%] h-[35vh] w-[35vh] rounded-full bg-pink-500/[0.05] blur-[120px]" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Rising star logo */}
        <div className="animate-fade-in">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-[60px] w-[60px] sm:h-[80px] sm:w-[80px]"
          >
            <defs>
              <linearGradient id="starGradient" x1="40" y1="0" x2="40" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            {/* 4-pointed star rising upward */}
            <path
              d="M40 4 L46 30 L72 36 L46 42 L40 68 L34 42 L8 36 L34 30 Z"
              fill="url(#starGradient)"
            />
            {/* Upward trail lines */}
            <line x1="40" y1="72" x2="40" y2="78" stroke="url(#starGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <line x1="34" y1="70" x2="32" y2="76" stroke="url(#starGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            <line x1="46" y1="70" x2="48" y2="76" stroke="url(#starGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
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
            <button className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.97]">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </SignUpButton>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-muted-foreground/50">
        Powered by AI
      </p>
    </div>
  );
}
