"use client";

import { useState, useTransition } from "react";
import { searchPosts } from "@/app/actions/search";
import { PostCard } from "@/components/post-card";
import { Spinner } from "@/components/loading";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSearch(searchQuery?: string) {
    const q = searchQuery || query;
    if (!q.trim()) return;

    startTransition(async () => {
      const posts = await searchPosts(q);
      setResults(posts);
      setSearched(true);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  function handleExample(example: string) {
    setQuery(example);
    handleSearch(example);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-foreground">AI Search</h1>
      <p className="mb-8 text-muted-foreground">
        Describe what you&apos;re looking for in natural language.
      </p>

      {/* Search bar */}
      <div className="relative mb-8">
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
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Try "sunset at the beach" or "city at night"'
          className="w-full rounded-2xl border border-border bg-card py-4 pl-12 pr-28 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={() => handleSearch()}
          disabled={isPending || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          {isPending ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Example searches */}
      {!searched && (
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Try searching for:
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "mountain landscape",
              "street photography",
              "colorful food",
              "pets playing",
              "city at night",
              "ocean waves",
              "portrait in natural light",
              "rainy day vibes",
            ].map((example) => (
              <button
                key={example}
                onClick={() => handleExample(example)}
                className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isPending && (
        <div className="py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Searching with AI...
          </p>
        </div>
      )}

      {/* Results */}
      {!isPending && searched && results.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto mb-4 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No results found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try a different description or browse the{" "}
            <a href="/feed" className="text-primary hover:underline">
              feed
            </a>
            .
          </p>
        </div>
      )}

      {!isPending && results.length > 0 && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? "s" : ""} for
            &quot;{query}&quot;
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((post: any, index: number) => (
              <PostCard
                key={post.id}
                post={{ ...post, users: post.users as any }}
                index={index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
