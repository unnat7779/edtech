"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { TrendingUp, Users, Crown, DollarSign, UserX } from "lucide-react"

export default function GrowthTrendsChart() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/analytics/students/growth-trends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        throw new Error("Failed to fetch growth trends data")
      }
    } catch (error) {
      console.error("Error fetching growth trends:", error)
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
            <div className="h-80 bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-700/50">
        Error loading growth trends: {error}
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 shadow-lg">
          <p className="text-slate-200 font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-300 text-sm">
                {entry.name}:{" "}
                <span className="font-semibold text-white">
                  {entry.name === "Revenue" ? `₹${entry.value.toLocaleString()}` : entry.value}
                  {entry.name === "Churn Rate" ? "%" : ""}
                </span>
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Calculate totals for summary
  const totals = data.reduce(
    (acc, month) => ({
      newSignups: acc.newSignups + month.newSignups,
      premiumConversions: acc.premiumConversions + month.premiumConversions,
      revenue: acc.revenue + month.revenue,
    }),
    { newSignups: 0, premiumConversions: 0, revenue: 0 },
  )

  const avgChurnRate = data.reduce((sum, month) => sum + month.churnRate, 0) / data.length

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          Monthly Growth Trends
          <span className="ml-auto text-sm font-normal text-slate-400">Last 6 Months</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#e2e8f0" }} />
              <Line
                type="monotone"
                dataKey="newSignups"
                stroke="#3b82f6"
                strokeWidth={3}
                name="New Signups"
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="premiumConversions"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Premium Conversions"
                dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                name="Revenue"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="churnRate"
                stroke="#ef4444"
                strokeWidth={3}
                name="Churn Rate"
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 text-sm">Total New Signups</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{totals.newSignups}</p>
            <p className="text-blue-300 text-xs">Last 6 months</p>
          </div>

          <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-amber-300 text-sm">Premium Conversions</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{totals.premiumConversions}</p>
            <p className="text-amber-300 text-xs">
              {totals.newSignups > 0 ? Math.round((totals.premiumConversions / totals.newSignups) * 100) : 0}%
              conversion rate
            </p>
          </div>

          <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-green-300 text-sm">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-green-400">₹{totals.revenue.toLocaleString()}</p>
            <p className="text-green-300 text-xs">₹{Math.round(totals.revenue / 6).toLocaleString()} avg/month</p>
          </div>

          <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <UserX className="h-4 w-4 text-red-400" />
              <span className="text-red-300 text-sm">Avg Churn Rate</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{avgChurnRate.toFixed(1)}%</p>
            <p className="text-red-300 text-xs">Monthly average</p>
          </div>
        </div>

        {/* Growth Insights */}
        <div className="mt-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
          <h4 className="text-slate-200 font-medium mb-3">Growth Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="text-slate-300">
              <span className="text-blue-400">Best Signup Month:</span>{" "}
              {data.reduce((max, month) => (month.newSignups > max.newSignups ? month : max), data[0])?.label} (
              {data.reduce((max, month) => (month.newSignups > max.newSignups ? month : max), data[0])?.newSignups}{" "}
              signups)
            </div>
            <div className="text-slate-300">
              <span className="text-green-400">Highest Revenue:</span>{" "}
              {data.reduce((max, month) => (month.revenue > max.revenue ? month : max), data[0])?.label} (₹
              {data
                .reduce((max, month) => (month.revenue > max.revenue ? month : max), data[0])
                ?.revenue.toLocaleString()}
              )
            </div>
            <div className="text-slate-300">
              <span className="text-amber-400">Best Conversion:</span>{" "}
              {
                data.reduce((max, month) => (month.premiumConversions > max.premiumConversions ? month : max), data[0])
                  ?.label
              }{" "}
              (
              {
                data.reduce((max, month) => (month.premiumConversions > max.premiumConversions ? month : max), data[0])
                  ?.premiumConversions
              }{" "}
              conversions)
            </div>
            <div className="text-slate-300">
              <span className="text-red-400">Lowest Churn:</span>{" "}
              {data.reduce((min, month) => (month.churnRate < min.churnRate ? month : min), data[0])?.label} (
              {data.reduce((min, month) => (month.churnRate < min.churnRate ? month : min), data[0])?.churnRate}% churn)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
