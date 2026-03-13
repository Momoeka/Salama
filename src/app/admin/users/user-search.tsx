"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    router.push(`/admin/users${params}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
      <input
        type="text"
        placeholder="Search by username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
      <button
        type="submit"
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
      >
        Search
      </button>
      {initialQuery && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.push("/admin/users");
          }}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
        >
          Clear
        </button>
      )}
    </form>
  );
}
