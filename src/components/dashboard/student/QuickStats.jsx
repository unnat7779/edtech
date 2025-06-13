"use client"

export default function QuickStats({ stats }) {
  const statItems = [
    {
      label: "Tests Taken",
      value: stats?.testsAttempted || 0,
      color: "blue",
      icon: "📝",
    },
    {
      label: "Average Score",
      value: stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : "0%",
      color: "green",
      icon: "📊",
    },
    {
      label: "Best Score",
      value: stats?.bestScore ? `${stats.bestScore.toFixed(1)}%` : "0%",
      color: "purple",
      icon: "🏆",
    },
    {
      label: "Time Spent",
      value: stats?.totalTimeSpent ? `${Math.round(stats.totalTimeSpent / 60)}h` : "0h",
      color: "orange",
      icon: "⏱️",
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => (
        <div key={index} className={`p-4 rounded-lg border ${getColorClasses(item.color)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{item.icon}</span>
            <div className="text-right">
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-sm opacity-75">{item.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
