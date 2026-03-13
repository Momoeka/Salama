import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/feed");

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-6">
      {/* Subtle ambient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/4 left-1/3 h-[50vh] w-[50vh] -translate-x-1/2 rounded-full bg-violet-500/[0.04] blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/3 h-[40vh] w-[40vh] rounded-full bg-purple-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="animate-fade-in mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-violet-500/20">
            <span className="text-2xl font-black text-white tracking-tight">S</span>
          </div>
        </div>

        {/* Brand */}
        <h1
          className="animate-slide-up mb-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
        >
          SALAMA
        </h1>

        <p
          className="animate-slide-up mb-10 max-w-sm text-center text-base text-muted-foreground sm:text-lg"
          style={{ animationDelay: "0.08s", animationFillMode: "backwards" }}
        >
          Share moments. Discover stories.
        </p>

        {/* Actions */}
        <div
          className="animate-slide-up flex items-center gap-3"
          style={{ animationDelay: "0.16s", animationFillMode: "backwards" }}
        >
          <SignInButton mode="modal">
            <button className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary active:scale-[0.98]">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 active:scale-[0.98]">
              Get Started
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
