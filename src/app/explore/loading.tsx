export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-7xl px-2 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-1 h-8 w-32 animate-pulse rounded bg-secondary" />
      <div className="mb-8 h-4 w-64 animate-pulse rounded bg-secondary" />
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-2xl bg-secondary" />
        ))}
      </div>
    </div>
  );
}
