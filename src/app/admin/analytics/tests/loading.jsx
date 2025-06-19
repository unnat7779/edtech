export default function TestAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Skeleton */}
      <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-64 mb-2"></div>
            <div className="h-8 bg-slate-700 rounded w-96 mb-2"></div>
            <div className="h-4 bg-slate-700 rounded w-80"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* LeetCode Style Dashboard Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 animate-pulse">
            <div className="h-8 bg-slate-700 rounded mb-4"></div>
            <div className="h-48 bg-slate-700 rounded"></div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 animate-pulse">
            <div className="h-8 bg-slate-700 rounded mb-4"></div>
            <div className="h-48 bg-slate-700 rounded"></div>
          </div>
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-slate-700 rounded mb-4"></div>
            <div className="h-64 bg-slate-700 rounded"></div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-slate-700 rounded mb-4"></div>
            <div className="h-64 bg-slate-700 rounded"></div>
          </div>
        </div>

        {/* More Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-slate-700 rounded mb-4"></div>
            <div className="h-64 bg-slate-700 rounded"></div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-slate-700 rounded mb-4"></div>
            <div className="h-64 bg-slate-700 rounded"></div>
          </div>
        </div>

        {/* Heatmap Skeleton */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-8 animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="h-80 bg-slate-700 rounded"></div>
        </div>

        {/* Top Performers Skeleton */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-700/30 rounded-lg p-4">
                <div className="h-4 bg-slate-600 rounded mb-2"></div>
                <div className="h-4 bg-slate-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
