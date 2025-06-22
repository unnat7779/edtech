"use client"

import React from "react"
import {Card}from "@/components/ui/Card"
import { Users, CheckCircle, AlertCircle, Send, Eye } from "lucide-react"

const SessionStatistics = React.memo(({ stats = {}, loading = false }) => {
  const statisticsData = React.useMemo(
    () => [
      {
        title: "Total Sessions",
        value: stats.total || 0,
        icon: Users,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
      },
      {
        title: "Pending",
        value: stats.pending || 0,
        icon: AlertCircle,
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
        percentage: stats.percentages?.pending || 0,
      },
      {
        title: "Responded",
        value: stats.responded || 0,
        icon: Send,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        percentage: stats.percentages?.responded || 0,
      },
      {
        title: "Received",
        value: stats.received || 0,
        icon: Eye,
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        percentage: stats.percentages?.received || 0,
      },
      {
        title: "Completed",
        value: stats.completed || 0,
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
        percentage: stats.percentages?.completed || 0,
      },
    ],
    [stats],
  )

  // Skeleton Loading Component
  const SkeletonCard = React.memo(({ stat }) => (
    <Card className={`${stat.bgColor} ${stat.borderColor} backdrop-blur-xl border animate-pulse`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-slate-600/50 rounded w-24 mb-3"></div>
            <div className="h-8 bg-slate-600/50 rounded w-16 mb-2"></div>
            {stat.title !== "Total Sessions" && <div className="h-3 bg-slate-600/50 rounded w-20"></div>}
          </div>
          <div className={`${stat.bgColor} p-3 rounded-lg`}>
            <div className="h-6 w-6 bg-slate-600/50 rounded"></div>
          </div>
        </div>
        {stat.title !== "Total Sessions" && (
          <div className="mt-4">
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-slate-600/50 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </Card>
  ))

  // Animated Number Component
  const AnimatedNumber = React.memo(({ value, duration = 1000 }) => {
    const [displayValue, setDisplayValue] = React.useState(0)

    React.useEffect(() => {
      if (loading) return

      let startTime = null
      const startValue = displayValue
      const endValue = value

      const animate = (currentTime) => {
        if (startTime === null) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)

        const currentValue = Math.floor(startValue + (endValue - startValue) * progress)
        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }, [value, loading, duration, displayValue])

    return <span>{displayValue}</span>
  })

  // Progress Bar Component
  const ProgressBar = React.memo(({ percentage, color }) => (
    <div className="mt-4">
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: loading ? "0%" : `${percentage}%`,
            background: loading ? "transparent" : undefined,
          }}
        ></div>
      </div>
    </div>
  ))

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statisticsData.map((stat, index) => (
          <SkeletonCard key={index} stat={stat} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statisticsData.map((stat, index) => {
        const Icon = stat.icon
        const progressColors = {
          "text-amber-400": "bg-gradient-to-r from-amber-500 to-amber-400",
          "text-blue-400": "bg-gradient-to-r from-blue-500 to-blue-400",
          "text-purple-400": "bg-gradient-to-r from-purple-500 to-purple-400",
          "text-green-400": "bg-gradient-to-r from-green-500 to-green-400",
        }

        return (
          <Card
            key={`${stat.title}-${stat.value}`} // Stable key based on content
            className={`${stat.bgColor} ${stat.borderColor} backdrop-blur-xl border transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-slate-400 text-sm font-medium mb-1">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color} mb-1`}>
                    <AnimatedNumber value={stat.value} />
                  </p>
                  {stat.percentage !== undefined && (
                    <p className="text-xs text-slate-500">
                      <AnimatedNumber value={stat.percentage} />% of total
                    </p>
                  )}
                </div>
                <div
                  className={`${stat.bgColor} p-3 rounded-lg transform transition-transform duration-300 hover:rotate-12`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>

              {stat.percentage !== undefined && (
                <ProgressBar percentage={stat.percentage} color={progressColors[stat.color]} />
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
})

SessionStatistics.displayName = "SessionStatistics"

export default SessionStatistics
