"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { BarChart } from "lucide-react"

export default function ScoreDistributionChart({ data }) {
  const scoreRanges = Object.entries(data).map(([range, count]) => ({
    range,
    count,
    percentage: 0, // Calculate based on total
  }))

  const total = scoreRanges.reduce((sum, item) => sum + item.count, 0)
  scoreRanges.forEach((item) => {
    item.percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
  })

  const getBarColor = (range) => {
    if (range.includes("0-17") || range.includes("17-33")) return "bg-red-500"
    if (range.includes("33-50") || range.includes("50-67")) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <BarChart className="h-5 w-5 text-purple-400" />
          Score Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scoreRanges.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">{item.range}</span>
                <div className="text-right">
                  <span className="text-slate-200 font-semibold">{item.count}</span>
                  <span className="text-slate-400 text-xs ml-2">({item.percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getBarColor(item.range)}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Total Completed Tests</span>
            <span className="text-slate-200 font-semibold">{total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
