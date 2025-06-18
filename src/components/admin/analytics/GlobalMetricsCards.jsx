"use client"

import { Card, CardContent } from "@/components/ui/Card"
import { Users, FileText, TrendingUp, Clock, Award, Target } from "lucide-react"

export default function GlobalMetricsCards({ data }) {
  const metrics = [
    {
      title: "Total Users",
      value: data.totalUsers.toLocaleString(),
      change: data.changePercentages?.users || 0,
      icon: Users,
      color: "from-blue-600 to-blue-700",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Total Attempts",
      value: data.totalAttempts.toLocaleString(),
      change: data.changePercentages?.attempts || 0,
      icon: FileText,
      color: "from-teal-600 to-teal-700",
      bgColor: "bg-teal-500/20",
    },
    {
      title: "Average Score",
      value: `${Math.round(data.averageTestScore)}%`,
      change: data.changePercentages?.score || 0,
      icon: Award,
      color: "from-yellow-600 to-yellow-700",
      bgColor: "bg-yellow-500/20",
    },
    {
      title: "Avg Time/Test",
      value: `${data.averageTimePerTest}m`,
      change: data.changePercentages?.time || 0,
      icon: Clock,
      color: "from-purple-600 to-purple-700",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Active Users",
      value: data.activeUsers.toLocaleString(),
      change: 0,
      icon: Target,
      color: "from-green-600 to-green-700",
      bgColor: "bg-green-500/20",
    },
    {
      title: "New Users",
      value: data.newUsersInPeriod.toLocaleString(),
      change: 0,
      icon: TrendingUp,
      color: "from-pink-600 to-pink-700",
      bgColor: "bg-pink-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card
            key={index}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{metric.title}</p>
                  <p className="text-3xl font-bold text-slate-100 mt-1">{metric.value}</p>
                  {metric.change !== 0 && (
                    <div className="flex items-center mt-2">
                      <TrendingUp className={`h-3 w-3 mr-1 ${metric.change > 0 ? "text-green-400" : "text-red-400"}`} />
                      <span className={`text-sm font-medium ${metric.change > 0 ? "text-green-400" : "text-red-400"}`}>
                        {metric.change > 0 ? "+" : ""}
                        {metric.change}%
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
