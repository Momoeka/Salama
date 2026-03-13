import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { StreamChatWrapper } from "@/components/stream-chat-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SALAMA - Share Your World",
  description:
    "A modern image gallery and social platform powered by AI. Upload, discover, and connect.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              {/* Logo */}
              <Link href="/" className="group flex items-center gap-2.5">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 72 72"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform group-hover:scale-105"
                >
                  <defs>
                    <linearGradient id="navLogoGrad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="var(--gradient-start)" />
                      <stop offset="100%" stopColor="var(--gradient-end)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M36 4C36 4 8 14 8 32C8 50 24 66 36 68C48 66 64 50 64 32C64 14 36 4 36 4Z"
                    fill="url(#navLogoGrad)"
                    opacity="0.15"
                  />
                  <path
                    d="M36 4C36 4 8 14 8 32C8 50 24 66 36 68C48 66 64 50 64 32C64 14 36 4 36 4Z"
                    stroke="url(#navLogoGrad)"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <path
                    d="M42 26C42 22.7 39.3 20 36 20C32.7 20 30 22.7 30 26C30 29.3 32.7 32 36 32C39.3 32 42 34.7 42 38C42 41.3 39.3 44 36 44C32.7 44 30 41.3 30 38"
                    stroke="url(#navLogoGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <span className="text-xl font-black tracking-tight text-foreground">
                  SALAMA
                </span>
              </Link>

              {/* Nav Links (shown when signed in) */}
              <Show when="signed-in">
                <div className="hidden items-center gap-1 sm:flex">
                  <Link
                    href="/feed"
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Feed
                  </Link>
                  <Link
                    href="/explore"
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Explore
                  </Link>
                  <Link
                    href="/search"
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Search
                  </Link>
                  <Link
                    href="/analytics"
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                      Analytics
                    </span>
                  </Link>
                  <Link
                    href="/upload"
                    className="rounded-xl bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] px-4 py-2 text-sm font-medium text-primary-foreground shadow-md transition-all hover:shadow-lg hover:opacity-90 hover:scale-[1.02]"
                  >
                    + Upload
                  </Link>
                </div>
              </Show>

              {/* Auth */}
              <div className="flex items-center gap-3">
                <Show when="signed-out">
                  <ThemeToggle />
                  <SignInButton mode="modal">
                    <button className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-xl bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] px-4 py-2 text-sm font-medium text-primary-foreground shadow-md transition-all hover:shadow-lg hover:opacity-90">
                      Sign Up
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <Link
                    href="/messages"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </Link>
                  <Link
                    href="/notifications"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </Link>
                  <Link
                    href="/profile"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>
                  <ThemeToggle />
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                      },
                    }}
                  />
                </Show>
              </div>
            </div>

          </nav>

          {/* Mobile Bottom Nav (fixed, 5 items) */}
          <Show when="signed-in">
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl sm:hidden pb-safe" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
              <div className="flex items-center justify-around px-2 pt-2">
                <Link
                  href="/feed"
                  className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                  </svg>
                  Feed
                </Link>
                <Link
                  href="/reels"
                  className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  Reels
                </Link>
                <Link
                  href="/upload"
                  className="flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-1 text-xs text-white"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] shadow-lg shadow-[var(--gradient-start)]/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </div>
                </Link>
                <Link
                  href="/messages"
                  className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Messages
                </Link>
                <Link
                  href="/profile"
                  className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </Link>
              </div>
            </nav>
          </Show>

          <StreamChatWrapper>
          <main className="min-h-[calc(100vh-4rem)] pb-20 sm:pb-0">{children}</main>
          </StreamChatWrapper>

          {/* Footer (hidden on mobile where bottom nav is shown) */}
          <footer className="hidden border-t border-border/50 bg-background/50 py-10 sm:block">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div className="flex items-center gap-2.5">
                  <svg width="28" height="28" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="var(--gradient-start)" />
                        <stop offset="100%" stopColor="var(--gradient-end)" />
                      </linearGradient>
                    </defs>
                    <path d="M36 4C36 4 8 14 8 32C8 50 24 66 36 68C48 66 64 50 64 32C64 14 36 4 36 4Z" stroke="url(#footerLogoGrad)" strokeWidth="3" fill="none" />
                    <path d="M42 26C42 22.7 39.3 20 36 20C32.7 20 30 22.7 30 26C30 29.3 32.7 32 36 32C39.3 32 42 34.7 42 38C42 41.3 39.3 44 36 44C32.7 44 30 41.3 30 38" stroke="url(#footerLogoGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  </svg>
                  <span className="text-sm font-bold text-foreground">SALAMA</span>
                </div>
                <div className="flex gap-6 text-xs text-muted-foreground">
                  <Link href="/feed" className="transition-colors hover:text-foreground">Feed</Link>
                  <Link href="/search" className="transition-colors hover:text-foreground">Search</Link>
                  <Link href="/upload" className="transition-colors hover:text-foreground">Upload</Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  &copy; {new Date().getFullYear()} SALAMA. Built with heart & AI.
                </p>
              </div>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
