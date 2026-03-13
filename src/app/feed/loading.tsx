export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-xl pb-8">
      {/* Stories skeleton */}
      <div className="flex gap-4 overflow-hidden px-4 pt-6 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 animate-pulse rounded-full bg-secondary" />
            <div className="h-2 w-12 animate-pulse rounded bg-secondary" />
          </div>
        ))}
      </div>
      {/* Post skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-b border-border bg-card">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-secondary" />
            <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
            <div className="ml-auto h-2 w-12 animate-pulse rounded bg-secondary" />
          </div>
          <div className="aspect-square w-full animate-pulse bg-secondary" />
          <div className="space-y-2 px-4 py-3">
            <div className="flex gap-4">
              <div className="h-6 w-6 animate-pulse rounded bg-secondary" />
              <div className="h-6 w-6 animate-pulse rounded bg-secondary" />
              <div className="h-6 w-6 animate-pulse rounded bg-secondary" />
            </div>
            <div className="h-3 w-20 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}
