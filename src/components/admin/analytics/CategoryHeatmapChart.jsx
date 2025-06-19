"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Grid, Info } from "lucide-react"

export default function CategoryHeatmapChart({ data }) {
  const [showInfo, setShowInfo] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState("avgScore")

  // No data handling
  if (!data || !data.categoryHeatmap || Object.keys(data.categoryHeatmap).length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid className="h-5 w-5 text-purple-400" />
              Category Performance Heatmap
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-slate-400">No category performance data available.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Extract categories and attempt counts
  const categories = Object.keys(data.categoryHeatmap)
  const attemptCounts = Object.keys(data.categoryHeatmap[categories[0]] || {}).sort(
    (a, b) => Number.parseInt(a) - Number.parseInt(b),
  )

  // Color scale function for heatmap
  const getColor = (value) => {
    // Score coloring (green gradient)
    if (selectedMetric === "avgScore") {
      if (value >= 90) return "bg-emerald-500"
      if (value >= 80) return "bg-emerald-600"
      if (value >= 70) return "bg-teal-600"
      if (value >= 60) return "bg-teal-700"
      if (value >= 50) return "bg-cyan-700"
      if (value >= 40) return "bg-cyan-800"
      if (value >= 30) return "bg-blue-800"
      return "bg-blue-900"
    }
    // Attempt count coloring (purple gradient)
    else {
      if (value >= 100) return "bg-purple-500"
      if (value >= 50) return "bg-purple-600"
      if (value >= 25) return "bg-purple-700"
      if (value >= 10) return "bg-purple-800"
      if (value >= 5) return "bg-indigo-800"
      return "bg-indigo-900"
    }
  }

  // Format value for display
  const formatValue = (value) => {
    if (selectedMetric === "avgScore") {
      return `${value.toFixed(1)}%`
    } else {
      return value
    }
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid className="h-5 w-5 text-purple-400" />
            Category Performance Heatmap
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-slate-300 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="avgScore">Average Score</option>
              <option value="attemptCount">Attempt Count</option>
            </select>
            <Info
              className="h-4 w-4 text-slate-400 cursor-pointer hover:text-purple-400 transition-colors"
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
            />
            {showInfo && (
              <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-lg z-10 w-64">
                <p className="text-xs text-slate-300">
                  This heatmap shows performance across different categories and attempt counts. Toggle between viewing
                  average scores or number of attempts.
                </p>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-slate-400 text-sm font-medium p-2">Category</th>
                {attemptCounts.map((count) => (
                  <th key={count} className="text-center text-slate-400 text-sm font-medium p-2">
                    {count} {Number.parseInt(count) === 1 ? "Test" : "Tests"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category} className="border-t border-slate-700/50">
                  <td className="text-left text-slate-300 text-sm font-medium p-2">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </td>
                  {attemptCounts.map((count) => {
                    const cellData = data.categoryHeatmap[category][count] || {}
                    const value = selectedMetric === "avgScore" ? cellData.avgScore || 0 : cellData.attemptCount || 0
                    return (
                      <td key={`${category}-${count}`} className="p-1">
                        <div
                          className={`${getColor(value)} rounded-md p-2 text-center text-white text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer`}
                          title={`${category} - ${count} Tests: ${formatValue(value)}`}
                        >
                          {formatValue(value)}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
