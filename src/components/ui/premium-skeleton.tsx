import { cn } from "@/lib/utils"

function PremiumSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-[#18181B] border border-white/10 relative overflow-hidden",
        "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-cyan-400/5 after:to-transparent after:-translate-x-full after:animate-[shimmer_2s_infinite]",
        className
      )}
      {...props}
    />
  )
}

export { PremiumSkeleton }
