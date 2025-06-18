"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Filter } from "lucide-react"

export default function FunnelChart({ data }) {
  const funnelSteps = [
    { label: "Registered Users", value: data.registered, color: "bg-blue-500" },
    { label: "Took First Test", value: data.firstTest, color: "bg-teal-500" },
    { label: "Completed & Reviewed Score", value: data.scoreReview, color: "bg-yellow-500" },
    { label: "Took Additional Tests", value: data.nextTest, color: "bg-green-500" },
  ]

  const maxValue = Math.max(...funnelSteps.map((step) => step.value))

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <Filter className="h-5 w-5 text-orange-400" />
          User Journey Funnel Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {funnelSteps.map((step, index) => {
            const percentage = maxValue > 0 ? ((step.value / maxValue) * 100).toFixed(1) : 0
            const conversionRate = index > 0 ? ((step.value / funnelSteps[index - 1].value) * 100).toFixed(1) : 100

            return (
              <div key={index} className="relative">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-300 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-slate-200 font-medium">{step.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-200 font-bold text-lg">{step.value.toLocaleString()}</p>
                    {index > 0 && <p className="text-slate-400 text-xs">{conversionRate}% conversion</p>}
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-700/50 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${step.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                {index < funnelSteps.length - 1 && (
                  <div className="flex justify-center mt-2">
                    <div className="w-px h-4 bg-slate-600"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Overall Conversion Rate</p>
              <p className="text-green-400 font-semibold">
                {maxValue > 0 ? ((data.nextTest / data.registered) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div>
              <p className="text-slate-400">Drop-off Rate</p>
              <p className="text-red-400 font-semibold">
                {maxValue > 0 ? (((data.registered - data.nextTest) / data.registered) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
