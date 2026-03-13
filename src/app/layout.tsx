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
  title: "SALAMA",
  description: "Share moments. Discover stories.",
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
          {/* Desktop Nav */}
          <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 text-sm font-bold text-white">
                  S
                </div>
                <span className="text-base font-bold text-foreground">
                  SALAMA
                </span>
              </Link>

              {/* Nav Links */}
              <Show when="signed-in">
                <div className="hidden items-center gap-0.5 sm:flex">
                  <Link
                    href="/feed"
                    className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Feed
                  </Link>
                  <Link
                    href="/explore"
                    className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Explore
                  </Link>
                  <Link
                    href="/search"
                    className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Search
                  </Link>
                  <Link
                    href="/upload"
                    className="ml-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Upload
                  </Link>
                </div>
              </Show>

              {/* Right side */}
              <div className="flex items-center gap-2">
                <Show when="signed-out">
                  <ThemeToggle />
                  <SignInButton mode="modal">
                    <button className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90">
                      Sign Up
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <Link
                    href="/messages"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </Link>
                  <Link
                    href="/notifications"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </Link>
                  <Link
                    href="/profile"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>
                  <ThemeToggle />
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-7 w-7",
                      },
                    }}
                  />
                </Show>
              </div>
            </div>
          </nav>

          {/* Mobile Bottom Nav */}
          <Show when="signed-in">
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl sm:hidden pb-safe" style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}>
              <div className="flex items-center justify-around px-1 pt-1.5 pb-1">
                <Link href="/feed" className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Home
                </Link>
                <Link href="/explore" className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  Explore
                </Link>
                <Link href="/upload" className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </div>
                </Link>
                <Link href="/messages" className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Chat
                </Link>
                <Link href="/profile" className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 text-[10px] text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </Link>
              </div>
            </nav>
          </Show>

          <main className="min-h-[calc(100vh-3.5rem)] pb-20 sm:pb-0">{children}</main>

          {/* Footer */}
          <footer className="hidden border-t border-border py-8 sm:block">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-purple-700 text-[10px] font-bold text-white">
                  S
                </div>
                <span className="text-xs font-semibold text-foreground">SALAMA</span>
              </div>
              <div className="flex gap-5 text-xs text-muted-foreground">
                <Link href="/feed" className="transition-colors hover:text-foreground">Feed</Link>
                <Link href="/explore" className="transition-colors hover:text-foreground">Explore</Link>
                <Link href="/search" className="transition-colors hover:text-foreground">Search</Link>
              </div>
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} SALAMA
              </p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
