import { PremiumSkeleton } from "@/components/ui/premium-skeleton"

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <PremiumSkeleton className="h-10 w-[250px]" />
        <PremiumSkeleton className="h-10 w-[120px]" />
      </div>
      <div className="border border-white/10 rounded-xl bg-black overflow-hidden">
        <div className="border-b border-white/10 bg-[#18181B]/50 h-12 flex items-center px-4 gap-4">
          <PremiumSkeleton className="h-4 w-1/4" />
          <PremiumSkeleton className="h-4 w-1/4" />
          <PremiumSkeleton className="h-4 w-1/4" />
          <PremiumSkeleton className="h-4 w-1/4" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-white/10 h-16 flex items-center px-4 gap-4">
            <PremiumSkeleton className="h-4 w-1/4" />
            <PremiumSkeleton className="h-4 w-1/4" />
            <PremiumSkeleton className="h-6 w-20 rounded-full" />
            <div className="flex justify-end w-1/4 gap-2">
              <PremiumSkeleton className="h-8 w-8 rounded-md" />
              <PremiumSkeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinanceiroSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 mb-6">
        <PremiumSkeleton className="h-10 w-[300px]" />
        <PremiumSkeleton className="h-4 w-[400px]" />
      </div>
      <PremiumSkeleton className="h-[400px] w-full rounded-xl" />
    </div>
  )
}
