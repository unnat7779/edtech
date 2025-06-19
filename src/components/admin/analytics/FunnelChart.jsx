"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Filter, Users, TrendingDown, RefreshCw, Info, TrendingUp, Activity } from "lucide-react"
import { useFunnelData } from "@/hooks/useFunnelData"
import { useState } from "react"

export default function FunnelChart() {
  const { data, loading, error, refetch } = useFunnelData()
  const [selectedStep, setSelectedStep] = useState(null)
  const [showInsights, setShowInsights] = useState(false)

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-400" />
            User Journey Funnel Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-16 w-16 text-slate-400 mb-4 animate-spin" />
            <div className="text-slate-400 text-center">
              <p className="font-medium mb-2">Loading Funnel Data...</p>
              <p className="text-sm text-slate-500">Analyzing user journey patterns</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-red-900/20 to-slate-900/60 backdrop-blur-xl border border-red-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Filter className="h-5 w-5 text-red-400" />
            User Journey Funnel Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <TrendingDown className="h-16 w-16 text-red-400 mb-4" />
            <div className="text-red-400 text-center">
              <p className="font-medium mb-2">Failed to Load Data</p>
              <p className="text-sm text-red-300 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.registered === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-400" />
            User Journey Funnel Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-slate-400 mb-4" />
            <div className="text-slate-400 text-center">
              <p className="font-medium mb-2">No User Data Available</p>
              <p className="text-sm text-slate-500">
                User journey analytics will appear here once students start registering
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const funnelSteps = [
    {
      id: "registered",
      label: "Registered Users",
      value: data.registered,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      description: "Total students who have signed up on the platform",
      icon: Users,
    },
    {
      id: "firstTest",
      label: "Took First Test",
      value: data.firstTest,
      color: "bg-teal-500",
      hoverColor: "hover:bg-teal-600",
      description: "Students who completed their first test attempt",
      icon: Activity,
    },
    {
      id: "nextTest",
      label: "Returning Test Takers",
      value: data.nextTest,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      description: "Students who took 2 or more tests (engaged users)",
      icon: TrendingUp,
    },
  ]

  const maxValue = Math.max(...funnelSteps.map((step) => step.value))

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-400" />
            User Journey Funnel Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className={`p-2 rounded-lg transition-colors ${
                showInsights ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              title="Toggle Insights"
            >
              <Info className="h-4 w-4" />
            </button>
            <button
              onClick={refetch}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        {data.timestamp && (
          <p className="text-slate-400 text-sm">Last updated: {new Date(data.timestamp).toLocaleString()}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {funnelSteps.map((step, index) => {
            const percentage = maxValue > 0 ? ((step.value / maxValue) * 100).toFixed(1) : 0
            const conversionRate =
              index > 0 && funnelSteps[index - 1].value > 0
                ? ((step.value / funnelSteps[index - 1].value) * 100).toFixed(1)
                : 100

            const isSelected = selectedStep === step.id
            const IconComponent = step.icon

            return (
              <div
                key={step.id}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isSelected ? "scale-105" : "hover:scale-102"
                }`}
                onClick={() => setSelectedStep(isSelected ? null : step.id)}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                        isSelected ? step.color : "bg-slate-700"
                      } text-white`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-slate-200 font-medium block">{step.label}</span>
                      {isSelected && <span className="text-slate-400 text-sm">{step.description}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-200 font-bold text-xl">{step.value.toLocaleString()}</p>
                    {index > 0 && (
                      <p
                        className={`text-sm ${
                          Number.parseFloat(conversionRate) >= 50
                            ? "text-green-400"
                            : Number.parseFloat(conversionRate) >= 25
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {conversionRate}% conversion
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-4 rounded-full ${step.color} transition-all duration-700 ease-out ${
                        isSelected ? "shadow-lg shadow-blue-500/30" : ""
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold drop-shadow-lg">{percentage}%</span>
                  </div>
                </div>

                {index < funnelSteps.length - 1 && (
                  <div className="flex justify-center mt-3">
                    <div className="w-px h-6 bg-gradient-to-b from-slate-600 to-transparent"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Key Metrics */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-slate-400 mb-1">Activation Rate</p>
              <p className="text-blue-400 font-bold text-lg">{data.metrics?.conversionToFirstTest || 0}%</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 mb-1">Retention Rate</p>
              <p className="text-green-400 font-bold text-lg">{data.metrics?.retentionRate || 0}%</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 mb-1">Avg Tests/User</p>
              <p className="text-yellow-400 font-bold text-lg">{data.metrics?.averageAttemptsPerUser || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 mb-1">Recent Active</p>
              <p className="text-purple-400 font-bold text-lg">{data.recentActiveUsers || 0}</p>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        {showInsights && (
          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" />
              Funnel Insights
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-slate-300">
                  <strong>{data.metrics?.conversionToFirstTest}%</strong> of registered users take their first test
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-300">
                  <strong>{data.metrics?.retentionRate}%</strong> of first-time test takers return for more tests
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-slate-300">
                  <strong>{data.recentActiveUsers}</strong> users were active in the last 30 days
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
