"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Users, RefreshCw } from "lucide-react"
import { useCohortData } from "@/hooks/useRetentionData"

export default function CohortHeatmap({ cohortType = "weekly", periods = 12 }) {
  const [selectedCell, setSelectedCell] = useState(null)
  const { data, loading, error, refresh } = useCohortData(cohortType, periods)

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Cohort Retention Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mb-4" />
            <p className="text-slate-400">Loading cohort data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data || !data.heatmapData) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Users className="h-5 w-5 text-red-400" />
            Cohort Retention Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Users className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-red-400 text-center mb-4">Error loading cohort data</p>
            <Button onClick={refresh} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { heatmapData, summary } = data
  const periods_columns = ["day1", "day7", "day14", "day30", "day60", "day90"]
  const periodLabels = ["1D", "7D", "14D", "30D", "60D", "90D"]

  // Get color intensity based on retention percentage
  const getColorIntensity = (value) => {
    if (value === 0) return "bg-slate-700/30"
    if (value < 10) return "bg-red-900/40"
    if (value < 25) return "bg-red-700/50"
    if (value < 40) return "bg-yellow-700/50"
    if (value < 60) return "bg-green-700/50"
    return "bg-green-500/60"
  }

  const getTextColor = (value) => {
    if (value === 0) return "text-slate-500"
    if (value < 25) return "text-red-300"
    if (value < 40) return "text-yellow-300"
    return "text-green-300"
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Cohort Retention Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={refresh} size="sm" className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-200">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Total Cohorts</div>
            <div className="text-lg font-bold text-slate-200">{summary.totalCohorts}</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Total Users</div>
            <div className="text-lg font-bold text-purple-400">{summary.totalUsers}</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Avg 7D Retention</div>
            <div className="text-lg font-bold text-green-400">{summary.avgRetention7Day}%</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-slate-400 text-xs">Avg 30D Retention</div>
            <div className="text-lg font-bold text-blue-400">{summary.avgRetention30Day}%</div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              <div className="text-slate-400 text-xs font-medium p-2">Cohort</div>
              {periodLabels.map((label) => (
                <div key={label} className="text-slate-400 text-xs font-medium p-2 text-center">
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap Rows */}
            <div className="space-y-1">
              {heatmapData.map((cohort, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-7 gap-1">
                  {/* Cohort Name */}
                  <div className="text-slate-300 text-xs p-2 bg-slate-700/20 rounded flex items-center">
                    <div>
                      <div className="font-medium truncate">{cohort.cohort}</div>
                      <div className="text-slate-500 text-xs">({cohort.size} users)</div>
                    </div>
                  </div>

                  {/* Retention Cells */}
                  {periods_columns.map((period, colIndex) => {
                    const value = cohort[period] || 0
                    const cellKey = `${rowIndex}-${colIndex}`

                    return (
                      <div
                        key={period}
                        className={`
                          ${getColorIntensity(value)} 
                          ${getTextColor(value)}
                          p-2 rounded text-xs font-medium text-center cursor-pointer
                          hover:scale-105 hover:brightness-110 transition-all duration-200
                          ${selectedCell === cellKey ? "ring-2 ring-purple-400" : ""}
                        `}
                        onClick={() => setSelectedCell(selectedCell === cellKey ? null : cellKey)}
                        title={`${cohort.cohort}: ${value}% retention at ${periodLabels[colIndex]}`}
                      >
                        {value}%
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-xs">Retention Rate:</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-slate-700/30 rounded"></div>
              <span className="text-xs text-slate-500">0%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-700/50 rounded"></div>
              <span className="text-xs text-slate-500">Low</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-700/50 rounded"></div>
              <span className="text-xs text-slate-500">Medium</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500/60 rounded"></div>
              <span className="text-xs text-slate-500">High</span>
            </div>
          </div>

          <div className="text-xs text-slate-500">Click cells for details • {cohortType} cohorts</div>
        </div>

        {/* Selected Cell Details */}
        {selectedCell && (
          <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
            <h4 className="text-slate-200 font-medium mb-2">Cohort Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Cohort:</span>
                <span className="text-slate-200 ml-2">
                  {heatmapData[Number.parseInt(selectedCell.split("-")[0])]?.cohort}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Size:</span>
                <span className="text-slate-200 ml-2">
                  {heatmapData[Number.parseInt(selectedCell.split("-")[0])]?.size} users
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
          <span>
            Last updated:{" "}
            {data.metadata?.generatedAt ? new Date(data.metadata.generatedAt).toLocaleString() : "Unknown"}
          </span>
          <span>
            {cohortType} analysis • {periods} periods
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
