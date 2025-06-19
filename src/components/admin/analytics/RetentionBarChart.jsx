"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { BarChart3, RefreshCw, Filter, Users } from "lucide-react"
import { useRetentionData } from "@/hooks/useRetentionData"

export default function RetentionBarChart({ timeRange = "30" }) {
  const [groupBy, setGroupBy] = useState("period") // period, cohort, segment
  const [selectedBars, setSelectedBars] = useState([])
  const [sortBy, setSortBy] = useState("value") // value, name, size

  const { data, loading, error, refresh } = useRetentionData(timeRange)

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-400" />
            Retention Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-orange-400 animate-spin mb-4" />
            <p className="text-slate-400">Loading comparison data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-red-400" />
            Retention Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <BarChart3 className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-red-400 text-center mb-4">Error loading comparison data</p>
            <Button onClick={refresh} className="bg-orange-600 hover:bg-orange-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data based on groupBy selection
  const prepareChartData = () => {
    if (groupBy === "period") {
      return [
        {
          name: "7-Day Retention",
          value: data.summary?.retention7Day || 0,
          color: "#10b981",
          description: "Users returning within 7 days",
        },
        {
          name: "14-Day Retention",
          value: data.summary?.retention14Day || 0,
          color: "#f59e0b",
          description: "Users returning within 14 days",
        },
        {
          name: "30-Day Retention",
          value: data.summary?.retention30Day || 0,
          color: "#ef4444",
          description: "Users returning within 30 days",
        },
      ]
    }

    if (groupBy === "cohort" && data.cohorts) {
      return data.cohorts.slice(0, 8).map((cohort, index) => ({
        name: cohort.cohort,
        value: cohort.retention7 || 0,
        color: `hsl(${(index * 45) % 360}, 60%, 50%)`,
        description: `${cohort.size} users in cohort`,
        size: cohort.size,
      }))
    }

    return []
  }

  const chartData = prepareChartData()

  // Sort data
  const sortedData = [...chartData].sort((a, b) => {
    if (sortBy === "value") return b.value - a.value
    if (sortBy === "name") return a.name.localeCompare(b.name)
    if (sortBy === "size") return (b.size || 0) - (a.size || 0)
    return 0
  })

  const maxValue = Math.max(...sortedData.map((d) => d.value), 100)

  // Toggle bar selection
  const toggleBar = (index) => {
    setSelectedBars((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const groupByOptions = [
    { value: "period", label: "By Period", icon: BarChart3 },
    { value: "cohort", label: "By Cohort", icon: Users },
  ]

  const sortOptions = [
    { value: "value", label: "By Value" },
    { value: "name", label: "By Name" },
    { value: "size", label: "By Size" },
  ]

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-400" />
            Retention Comparison
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Group By Selector */}
            <div className="flex bg-slate-700/50 rounded-lg p-1">
              {groupByOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setGroupBy(option.value)}
                    className={`px-3 py-1 rounded text-xs flex items-center gap-1 transition-all ${
                      groupBy === option.value ? "bg-orange-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {option.label}
                  </button>
                )
              })}
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700/50 text-slate-200 text-xs px-3 py-1 rounded border border-slate-600 focus:border-orange-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <Button onClick={refresh} size="sm" className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-200">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {sortedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <BarChart3 className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-400">No comparison data available</p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="space-y-4 mb-6">
              {sortedData.map((item, index) => {
                const isSelected = selectedBars.includes(index)
                const barWidth = (item.value / maxValue) * 100

                return (
                  <div
                    key={index}
                    className={`group cursor-pointer transition-all duration-300 ${
                      isSelected ? "scale-105" : "hover:scale-102"
                    }`}
                    onClick={() => toggleBar(index)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-300 text-sm font-medium">{item.name}</span>
                        {item.size && <span className="text-slate-500 text-xs">({item.size} users)</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-bold">{item.value}%</span>
                        {isSelected && <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="w-full bg-slate-700/50 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: item.color,
                            filter: isSelected ? "brightness(1.2)" : "brightness(1)",
                          }}
                        >
                          {barWidth > 20 && <span className="text-white text-xs font-medium">{item.value}%</span>}
                        </div>
                      </div>

                      {/* Hover tooltip */}
                      <div className="absolute left-0 -top-8 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {item.description}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="text-slate-400 text-xs">Highest</div>
                <div className="text-lg font-bold text-green-400">{Math.max(...sortedData.map((d) => d.value))}%</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="text-slate-400 text-xs">Lowest</div>
                <div className="text-lg font-bold text-red-400">{Math.min(...sortedData.map((d) => d.value))}%</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="text-slate-400 text-xs">Average</div>
                <div className="text-lg font-bold text-blue-400">
                  {Math.round(sortedData.reduce((sum, d) => sum + d.value, 0) / sortedData.length)}%
                </div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="text-slate-400 text-xs">Selected</div>
                <div className="text-lg font-bold text-orange-400">{selectedBars.length}</div>
              </div>
            </div>

            {/* Selected Items Details */}
            {selectedBars.length > 0 && (
              <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
                <h4 className="text-slate-200 font-medium mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Selected Items ({selectedBars.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedBars.map((index) => {
                    const item = sortedData[index]
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-600/30 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-slate-300 text-sm">{item.name}</span>
                        </div>
                        <span className="text-slate-200 font-medium">{item.value}%</span>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={() => setSelectedBars([])}
                  className="mt-3 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear selection
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
          <span>
            Grouped by {groupBy} • Sorted by {sortBy}
          </span>
          <span>{sortedData.length} items • Click bars to select</span>
        </div>
      </CardContent>
    </Card>
  )
}
