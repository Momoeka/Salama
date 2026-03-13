export default function MessagesLoading() {
  return (
    <div className="mx-auto max-w-2xl px-2 py-4 sm:px-6 sm:py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded bg-secondary" />
        <div className="h-10 w-32 animate-pulse rounded-xl bg-secondary" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-secondary" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-secondary" />
            <div className="h-2.5 w-48 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}
