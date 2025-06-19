export default function RetentionAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Skeleton */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-64 mb-4"></div>
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 bg-slate-700 rounded w-80 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-96"></div>
              </div>
              <div className="h-10 bg-slate-700 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Skeleton */}
        <div className="mb-8">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6">
            <div className="animate-pulse">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-slate-700 rounded-lg w-24"></div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="h-10 bg-slate-700 rounded-lg w-32"></div>
                  <div className="h-10 bg-slate-700 rounded-lg w-32"></div>
                  <div className="h-10 bg-slate-700 rounded w-10"></div>
                  <div className="h-10 bg-slate-700 rounded w-10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-slate-700 rounded"></div>
                    <div className="h-6 bg-slate-700 rounded w-48"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-slate-700 rounded"></div>
                    <div className="w-8 h-8 bg-slate-700 rounded"></div>
                  </div>
                </div>

                {/* Chart area */}
                <div className="h-64 bg-slate-700/30 rounded-lg mb-4"></div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="bg-slate-700/30 rounded-lg p-3">
                      <div className="h-3 bg-slate-600 rounded w-16 mb-2"></div>
                      <div className="h-6 bg-slate-600 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="mt-12">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-lg p-6">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="w-8 h-8 bg-slate-700 rounded mx-auto mb-2"></div>
                    <div className="h-5 bg-slate-700 rounded w-32 mx-auto mb-1"></div>
                    <div className="h-4 bg-slate-700 rounded w-48 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
