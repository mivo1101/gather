function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-black/[0.07] ${className}`} />;
}

export default function AppLoading() {
  return (
    <div className="animate-fade-up" aria-label="Loading page" role="status">
      <SkeletonLine className="h-9 w-52" />
      <SkeletonLine className="mt-3 h-4 w-full max-w-md" />
      <div className="mt-8 border-b border-black/[0.06] pb-3">
        <div className="flex gap-7">
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-4 w-16" />
        </div>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-black/[0.05] bg-white p-5"
          >
            <SkeletonLine className="h-5 w-36" />
            <SkeletonLine className="mt-4 h-3 w-full" />
            <SkeletonLine className="mt-2 h-3 w-3/4" />
            <div className="mt-6 h-28 animate-pulse rounded-xl bg-black/[0.04]" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
