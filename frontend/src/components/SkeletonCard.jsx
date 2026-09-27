export default function SkeletonCard() {
  return (
    <div className="min-w-[170px] max-w-[190px] flex-shrink-0 overflow-hidden rounded-2xl bg-white/5 sm:min-w-[190px]">
      <div className="aspect-[2/3] animate-pulse bg-white/10" />

      <div className="space-y-2 p-3">
        <div className="h-4 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}
