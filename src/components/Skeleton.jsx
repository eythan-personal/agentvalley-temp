/**
 * Skeleton loader primitives.
 * Use <Skeleton /> for inline shapes, or the pre-built page skeletons below.
 */

export function Skeleton({ className = '', style }) {
  return (
    <div
      className={`skeleton-shimmer rounded-md ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

export function StartupCardSkeleton() {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden flex flex-col">
      <Skeleton className="h-20 rounded-none" />
      <div className="px-4 pt-4 pb-4 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-28 mb-1.5" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-3 w-full mb-1.5" />
        <Skeleton className="h-3 w-3/4 mb-4" />
        <div className="border-t border-[var(--color-border)] pt-3 mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-3 w-14" />
          </div>
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function StartupListRowSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[3fr_110px_100px_80px_100px_80px_90px_80px] gap-2 lg:gap-3 px-5 lg:px-6 py-4 items-center border-b border-[var(--color-border)] last:border-b-0">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div>
          <Skeleton className="h-4 w-36 mb-1.5" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-3 w-14 hidden lg:block" />
      <Skeleton className="h-3 w-12 hidden lg:block" />
      <Skeleton className="h-3 w-12 hidden lg:block" />
      <Skeleton className="h-3 w-14 hidden lg:block" />
      <Skeleton className="h-3 w-10 hidden lg:block" />
      <Skeleton className="h-6 w-16 rounded-md hidden lg:block" />
      <Skeleton className="h-7 w-14 rounded-lg hidden lg:block" />
    </div>
  )
}

export function LeaderboardRowSkeleton() {
  return (
    <div className="grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_1fr_1fr_1fr_100px_100px] gap-4 px-4 md:px-6 py-4 items-center border-b border-[var(--color-border)] last:border-b-0">
      <Skeleton className="w-6 h-4 mx-auto" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div>
          <Skeleton className="h-4 w-24 mb-1.5" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-3 w-20 hidden md:block" />
      <Skeleton className="h-4 w-16 hidden md:block" />
      <Skeleton className="h-3 w-14 hidden md:block" />
      <Skeleton className="h-6 w-14 rounded-md hidden md:block" />
    </div>
  )
}

export function JobRowSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_130px_90px_70px] gap-3 lg:gap-4 px-5 lg:px-6 py-4 items-center border-b border-[var(--color-border)] last:border-b-0">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div>
          <Skeleton className="h-4 w-36 mb-1.5" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-32 hidden lg:block" />
      <Skeleton className="h-3 w-20 hidden lg:block" />
      <Skeleton className="h-6 w-16 rounded-md hidden lg:block" />
      <Skeleton className="h-3 w-10 hidden lg:block" />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="pt-24 px-6">
      <div className="max-w-[var(--container)] mx-auto grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* Left — profile card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
          <Skeleton className="w-20 h-20 rounded-2xl mb-5" />
          <Skeleton className="h-6 w-36 mb-2" />
          <Skeleton className="h-4 w-24 mb-5" />
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <Skeleton className="h-4 w-40 mb-6" />
          <div className="border-t border-[var(--color-border)] pt-5 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--color-border)] mt-5 pt-5">
            <Skeleton className="h-3 w-12 mb-3" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-md" />
              ))}
            </div>
          </div>
          <div className="border-t border-[var(--color-border)] mt-5 pt-5">
            <Skeleton className="h-3 w-12 mb-3" />
            <Skeleton className="h-3 w-full mb-1.5" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>

        {/* Right — event feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex gap-3 mb-6">
            <Skeleton className="h-9 w-48 rounded-lg" />
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="border-t border-[var(--color-border)]">
            <Skeleton className="h-3 w-12 mt-5 mb-3" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-[var(--color-border)]/50">
                <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-64 mb-1.5" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-14 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
