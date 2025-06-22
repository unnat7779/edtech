"use client"

export default function LoadingSkeletons({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-slate-800 rounded-xl border border-slate-700 p-6 animate-pulse">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
              <div className="flex gap-2">
                <div className="h-3 bg-slate-700 rounded w-16" />
                <div className="h-3 bg-slate-700 rounded w-20" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-700 rounded" />
              <div className="h-4 bg-slate-700 rounded w-24" />
              <div className="h-4 w-4 bg-slate-700 rounded ml-2" />
              <div className="h-4 bg-slate-700 rounded w-16" />
            </div>

            <div className="flex items-center gap-2">
              <div className="h-6 bg-slate-700 rounded w-20" />
              <div className="h-4 bg-slate-700 rounded w-12" />
            </div>

            <div className="space-y-2">
              <div className="h-4 bg-slate-700 rounded w-full" />
              <div className="h-4 bg-slate-700 rounded w-2/3" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-slate-700 rounded w-20" />
            <div className="h-8 bg-slate-700 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
