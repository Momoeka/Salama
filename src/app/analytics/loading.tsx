export default function AnalyticsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 h-8 w-56 animate-pulse rounded-lg bg-secondary" />
        <div className="h-4 w-72 animate-pulse rounded bg-secondary" />
      </div>

      {/* Overview Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-3 h-4 w-24 animate-pulse rounded bg-secondary" />
            <div className="h-8 w-16 animate-pulse rounded bg-secondary" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <div className="mb-2 h-5 w-40 animate-pulse rounded bg-secondary" />
        <div className="mb-6 h-3 w-56 animate-pulse rounded bg-secondary" />
        <div className="flex items-end gap-3" style={{ height: "220px" }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-end" style={{ height: "100%" }}>
              <div
                className="w-full animate-pulse rounded-t-lg bg-secondary"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
              <div className="mt-2 h-2 w-full animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Posts skeleton */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-2 h-5 w-28 animate-pulse rounded bg-secondary" />
          <div className="mb-4 h-3 w-52 animate-pulse rounded bg-secondary" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-2">
                <div className="h-6 w-6 animate-pulse rounded-full bg-secondary" />
                <div className="h-12 w-12 animate-pulse rounded-lg bg-secondary" />
                <div className="flex-1">
                  <div className="mb-1 h-4 w-3/4 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity skeleton */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-2 h-5 w-36 animate-pulse rounded bg-secondary" />
          <div className="mb-4 h-3 w-52 animate-pulse rounded bg-secondary" />
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-secondary" />
                <div className="flex-1">
                  <div className="mb-1 h-4 w-3/4 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
