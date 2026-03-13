export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" }[size];
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClass} animate-spin rounded-full border-2 border-border border-t-primary`}
      />
    </div>
  );
}

function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-secondary ${className}`} />
  );
}

export function PostSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <ShimmerBlock className="aspect-square rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ShimmerBlock className="h-6 w-6 rounded-full" />
          <ShimmerBlock className="h-4 w-24" />
        </div>
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-2/3" />
        <div className="flex gap-1">
          <ShimmerBlock className="h-5 w-14 rounded-full" />
          <ShimmerBlock className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <ShimmerBlock className="mb-8 h-9 w-32" />
      {/* Stories skeleton */}
      <div className="mb-8 flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <ShimmerBlock className="h-16 w-16 rounded-full" />
            <ShimmerBlock className="h-3 w-12" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-6">
        <ShimmerBlock className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <ShimmerBlock className="h-7 w-48" />
          <ShimmerBlock className="h-4 w-64" />
          <div className="flex gap-6">
            <ShimmerBlock className="h-5 w-20" />
            <ShimmerBlock className="h-5 w-20" />
            <ShimmerBlock className="h-5 w-20" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ShimmerBlock key={i} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}

export function UploadSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <ShimmerBlock className="mb-8 h-9 w-48" />
      <ShimmerBlock className="mb-6 h-64 rounded-2xl" />
      <div className="space-y-4">
        <ShimmerBlock className="h-24 rounded-xl" />
        <ShimmerBlock className="h-12 rounded-xl" />
      </div>
    </div>
  );
}
