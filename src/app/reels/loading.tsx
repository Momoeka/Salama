export default function ReelsLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-48 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}
