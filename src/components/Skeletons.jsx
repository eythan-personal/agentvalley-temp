/**
 * Skeleton loading components for dashboard sections.
 * Uses the existing .skeleton-shimmer class from index.css.
 */

function Bone({ className = '' }) {
  return <div className={`skeleton-shimmer rounded ${className}`} />
}

/** Skeleton for the top stats row (revenue, agents, mcap, token) */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
          <Bone className="h-3 w-16 mb-3" />
          <Bone className="h-6 w-24 mb-2" />
          <Bone className="h-3 w-12" />
        </div>
      ))}
    </div>
  )
}

/** Skeleton for the activity chart area */
export function ChartSkeleton() {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
      <Bone className="h-4 w-32 mb-4" />
      <Bone className="h-[140px] w-full rounded-xl" />
    </div>
  )
}

/** Skeleton for a list of task cards */
export function TaskListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 flex items-center gap-3">
          <Bone className="h-7 w-7 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Bone className="h-3.5 w-3/4" />
            <Bone className="h-3 w-1/2" />
          </div>
          <Bone className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/** Skeleton for an objective card */
export function ObjectiveSkeleton() {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Bone className="h-4 w-40" />
        <Bone className="h-5 w-20 rounded-full" />
      </div>
      <Bone className="h-2 w-full rounded-full" />
      <div className="flex gap-4">
        <Bone className="h-3 w-24" />
        <Bone className="h-3 w-24" />
      </div>
    </div>
  )
}

/** Skeleton for the agent sidebar cards */
export function AgentsSkeleton({ count = 2 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <Bone className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Bone className="h-3.5 w-24" />
            <Bone className="h-3 w-16" />
          </div>
          <Bone className="h-2 w-2 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/** Skeleton for the token tab stats and chart */
export function TokenSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4">
            <Bone className="h-3 w-14 mb-2" />
            <Bone className="h-5 w-20" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5">
        <Bone className="h-[200px] w-full rounded-xl" />
      </div>
    </div>
  )
}

/** Skeleton for feed items */
export function FeedSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Bone className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Bone className="h-3.5 w-32" />
              <Bone className="h-3 w-20" />
            </div>
          </div>
          <Bone className="h-16 w-full rounded-lg" />
          <div className="flex gap-3">
            <Bone className="h-6 w-14 rounded-full" />
            <Bone className="h-6 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Full-page dashboard skeleton combining all sections */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" style={{ animationDuration: '2s' }}>
      <StatsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ChartSkeleton />
          <ObjectiveSkeleton />
          <TaskListSkeleton count={3} />
        </div>
        <div className="space-y-4">
          <AgentsSkeleton />
          <FeedSkeleton count={2} />
        </div>
      </div>
    </div>
  )
}
