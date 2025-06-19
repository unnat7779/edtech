"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { PieChart } from "lucide-react"

export default function UserTypeChart({ data }) {
  // Add safety checks for data prop
  if (!data || typeof data !== "object") {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-400" />
            User Type Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-400 text-center">
              <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Provide default values for missing properties
  const safeData = {
    new: data.new || 0,
    returning: data.returning || 0,
    premium: data.premium || 0,
    nonPremium: data.nonPremium || 0,
  }

  const total = Object.values(safeData).reduce((sum, value) => sum + value, 0)

  // Show empty state if no data
  if (total === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-400" />
            User Type Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-400 text-center">
              <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const userTypes = [
    {
      label: "New Users",
      value: safeData.new,
      color: "bg-blue-500",
      percentage: ((safeData.new / total) * 100).toFixed(1),
    },
    {
      label: "Returning Users",
      value: safeData.returning,
      color: "bg-teal-500",
      percentage: ((safeData.returning / total) * 100).toFixed(1),
    },
    {
      label: "Premium Users",
      value: safeData.premium,
      color: "bg-yellow-500",
      percentage: ((safeData.premium / total) * 100).toFixed(1),
    },
    {
      label: "Free Users",
      value: safeData.nonPremium,
      color: "bg-slate-500",
      percentage: ((safeData.nonPremium / total) * 100).toFixed(1),
    },
  ]

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-400" />
          User Type Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userTypes.map((type, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                <span className="text-slate-300 text-sm">{type.label}</span>
              </div>
              <div className="text-right">
                <p className="text-slate-200 font-semibold">{type.value.toLocaleString()}</p>
                <p className="text-slate-400 text-xs">{type.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Total Users</span>
            <span className="text-slate-200 font-semibold">{total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
