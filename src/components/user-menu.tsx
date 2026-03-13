"use client";

import { UserButton } from "@clerk/nextjs";

export function UserMenu() {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-9 w-9 ring-2 ring-border",
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Link
          label="Profile"
          labelIcon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
          href="/profile"
        />
        <UserButton.Link
          label="Analytics"
          labelIcon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          }
          href="/analytics"
        />
        <UserButton.Action
          label="Toggle theme"
          labelIcon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          }
          onClick={() => {
            const html = document.documentElement;
            const isDark = html.classList.contains("dark");
            html.classList.toggle("dark");
            localStorage.setItem("salama-theme", isDark ? "light" : "dark");
          }}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
