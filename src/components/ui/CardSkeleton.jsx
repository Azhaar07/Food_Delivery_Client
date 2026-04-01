export const CardSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-[28px] border border-white/[0.08] bg-white/[0.04] ${className}`}>
    <div className="h-full rounded-[28px] bg-gradient-to-br from-white/[0.06] to-transparent" />
  </div>
)
