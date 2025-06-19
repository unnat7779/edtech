"use client"

import { Card, CardContent } from "@/components/ui/Card"
import { Users, FileText, TrendingUp, Clock, Award, Target } from "lucide-react"

export default function GlobalMetricsCards({ data }) {
  const metrics = [
    {
      title: "Total Users",
      value: data.totalUsers?.toLocaleString() || "0",
      change: data.changePercentages?.users || 0,
      icon: Users,
      description: "Registered students",
    },
    {
      title: "Total Attempts",
      value: data.totalAttempts?.toLocaleString() || "0",
      change: data.changePercentages?.attempts || 0,
      icon: FileText,
      description: "Test submissions",
    },
    {
      title: "Average Score",
      value: `${Math.round(data.averageTestScore || 0)}%`,
      change: data.changePercentages?.score || 0,
      icon: Award,
      description: "Overall performance",
    },
    {
      title: "Avg Time/Test",
      value: data.averageTimePerTest ? `${data.averageTimePerTest}m` : "N/A",
      change: data.changePercentages?.time || 0,
      icon: Clock,
      description: "Time per attempt",
    },
    {
      title: "Active Users",
      value: data.activeUsers?.toLocaleString() || "0",
      change: 0,
      icon: Target,
      description: "Recent activity",
    },
    {
      title: "New Users",
      value: data.newUsersInPeriod?.toLocaleString() || "0",
      change: 0,
      icon: TrendingUp,
      description: "This period",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const hasChange = metric.change !== 0
        const isPositive = metric.change > 0

        return (
          <Card
            key={index}
            className="
              bg-white/5 backdrop-blur-sm border border-white/10
              hover:bg-white/8 hover:border-white/20
              transition-all duration-300 ease-out
              hover:shadow-xl hover:shadow-black/10
              hover:-translate-y-1
              group cursor-pointer
            "
          >
            <CardContent className="p-8 scale">
              {/* Icon */}
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-white/80" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                {/* Title */}
                <h3 className="text-sm font-medium text-white/60 tracking-wide uppercase">{metric.title}</h3>

                {/* Value */}
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-white tracking-tight">{metric.value}</span>
                  {hasChange && (
                    <span
                      className={`
                        text-sm font-medium px-2 py-1 rounded-full
                        ${isPositive ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}
                      `}
                    >
                      {isPositive ? "+" : ""}
                      {metric.change}%
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-white/40 font-light">{metric.description}</p>
              </div>

              {/* Subtle bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
