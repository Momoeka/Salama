export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="h-24 w-24 animate-pulse rounded-full bg-secondary" />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="h-6 w-36 animate-pulse rounded bg-secondary mx-auto sm:mx-0" />
          <div className="h-3 w-48 animate-pulse rounded bg-secondary mx-auto sm:mx-0" />
          <div className="flex justify-center gap-8 sm:justify-start">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="h-5 w-8 animate-pulse rounded bg-secondary mx-auto" />
                <div className="h-2 w-14 animate-pulse rounded bg-secondary" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    </div>
  );
}
