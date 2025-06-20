"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { TrendingDown, Users, Heart, Crown, CheckCircle } from "lucide-react"

export default function ConversionFunnelChart() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/analytics/students/conversion-funnel", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        throw new Error("Failed to fetch conversion funnel data")
      }
    } catch (error) {
      console.error("Error fetching conversion funnel:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="h-96 bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-700/50">
        Error loading conversion funnel: {error}
      </div>
    )
  }

  const getStageIcon = (stageName) => {
    switch (stageName) {
      case "Total Users":
        return <Users className="h-5 w-5" />
      case "Interested Users":
        return <Heart className="h-5 w-5" />
      case "Premium Signups":
        return <Crown className="h-5 w-5" />
      case "Active Premium":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getStageColor = (index) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-amber-500 to-amber-600",
      "from-green-500 to-green-600",
    ]
    return colors[index] || "from-gray-500 to-gray-600"
  }

  const getTextColor = (index) => {
    const colors = ["text-blue-400", "text-purple-400", "text-amber-400", "text-green-400"]
    return colors[index] || "text-gray-400"
  }

  const getBorderColor = (index) => {
    const colors = ["border-blue-500/20", "border-purple-500/20", "border-amber-500/20", "border-green-500/20"]
    return colors[index] || "border-gray-500/20"
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-purple-400" />
          Conversion Funnel Analysis
          <span className="ml-auto text-sm font-normal text-slate-400">User Journey</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.stages.map((stage, index) => {
            const nextStage = data.stages[index + 1]
            const width = Math.max((stage.count / data.stages[0].count) * 100, 10)

            return (
              <div key={index} className="relative">
                {/* Stage Bar */}
                <div className="relative">
                  <div
                    className={`bg-gradient-to-r ${getStageColor(index)} rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] border ${getBorderColor(index)}`}
                    style={{ width: `${width}%` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${getTextColor(index)}`}>{getStageIcon(stage.name)}</div>
                        <div>
                          <h3 className="text-white font-semibold">{stage.name}</h3>
                          <p className="text-white/80 text-sm">{stage.count.toLocaleString()} users</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-xl">{stage.percentage}%</div>
                        {stage.conversionRate && (
                          <div className="text-white/80 text-sm">{stage.conversionRate}% conversion</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Percentage indicator */}
                  <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-medium">
                    {stage.percentage}%
                  </div>
                </div>

                {/* Conversion Arrow and Rate */}
                {nextStage && (
                  <div className="flex items-center my-2 ml-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-0 h-0 border-l-4 border-l-slate-400 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                      <span className="text-sm">{nextStage.conversionRate}% convert to next stage</span>
                      <div className="text-xs bg-slate-700 px-2 py-1 rounded">
                        -{(stage.count - nextStage.count).toLocaleString()} users drop off
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700/50">
          {data.stages.map((stage, index) => (
            <div key={index} className={`bg-slate-700/30 p-3 rounded-lg border ${getBorderColor(index)}`}>
              <div className={`flex items-center gap-2 ${getTextColor(index)}`}>
                {getStageIcon(stage.name)}
                <span className="text-xs font-medium">{stage.name}</span>
              </div>
              <p className="text-xl font-bold text-white mt-1">{stage.count}</p>
              <p className="text-slate-400 text-xs">{stage.percentage}% of total</p>
            </div>
          ))}
        </div>

        {/* Key Insights */}
        <div className="mt-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
          <h4 className="text-slate-200 font-medium mb-2">Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="text-slate-300">
              <span className="text-purple-400">Interest Conversion:</span>{" "}
              {data.stages[1] ? Math.round((data.stages[1].count / data.stages[0].count) * 100) : 0}% of users show
              interest
            </div>
            <div className="text-slate-300">
              <span className="text-amber-400">Premium Conversion:</span>{" "}
              {data.stages[2] ? Math.round((data.stages[2].count / data.stages[0].count) * 100) : 0}% become premium
              users
            </div>
            <div className="text-slate-300">
              <span className="text-green-400">Activation Rate:</span>{" "}
              {data.stages[3] && data.stages[2] ? Math.round((data.stages[3].count / data.stages[2].count) * 100) : 0}%
              of premium users stay active
            </div>
            <div className="text-slate-300">
              <span className="text-blue-400">Overall Conversion:</span>{" "}
              {data.stages[3] ? Math.round((data.stages[3].count / data.stages[0].count) * 100) : 0}% end-to-end
              conversion
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
