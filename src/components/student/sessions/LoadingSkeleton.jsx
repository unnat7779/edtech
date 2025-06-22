"use client"

export default function LoadingSkeleton() {
  return (
    <div className="session-grid">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 animate-pulse"
        >
          {/* Header skeleton */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-700 rounded-xl"></div>
                <div className="h-5 bg-slate-700 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-slate-700 rounded w-24"></div>
                <div className="h-4 bg-slate-700 rounded w-40"></div>
              </div>
            </div>
            <div className="h-6 bg-slate-700 rounded w-20"></div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="h-3 bg-slate-700 rounded w-20 mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-full mb-1"></div>
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
              <div className="h-4 bg-slate-700 rounded w-24"></div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
              <div className="h-6 bg-slate-700 rounded w-16"></div>
            </div>
          </div>

          {/* Action skeleton */}
          <div className="flex gap-2">
            <div className="h-10 bg-slate-700 rounded flex-1"></div>
            <div className="h-10 bg-slate-700 rounded flex-1"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
