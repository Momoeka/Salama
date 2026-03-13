export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 h-8 w-40 animate-pulse rounded bg-secondary" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl p-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-2 w-16 animate-pulse rounded bg-secondary" />
          </div>
          <div className="h-11 w-11 animate-pulse rounded-lg bg-secondary" />
        </div>
      ))}
    </div>
  );
}
