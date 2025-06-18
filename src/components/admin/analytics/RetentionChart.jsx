"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { TrendingUp } from "lucide-react"

export default function RetentionChart({ data }) {
  const retentionPeriods = [
    { label: "7 Days", value: data.day7, color: "bg-green-500" },
    { label: "14 Days", value: data.day14, color: "bg-yellow-500" },
    { label: "30 Days", value: data.day30, color: "bg-red-500" },
  ]

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          User Retention Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {retentionPeriods.map((period, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">{period.label} Retention</span>
                <span className="text-slate-200 font-semibold">{period.value}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className={`h-2 rounded-full ${period.color}`} style={{ width: `${period.value}%` }}></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <p className="text-slate-400 text-xs">
            Percentage of users who return to take additional tests within the specified time period
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
