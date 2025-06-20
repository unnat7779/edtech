"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Target, TrendingUp, Users } from "lucide-react"

export default function InterestConversionChart() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/analytics/students/interest-conversion", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        throw new Error("Failed to fetch interest conversion data")
      }
    } catch (error) {
      console.error("Error fetching interest conversion:", error)
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
            <div className="h-64 bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900/20 rounded-lg border border-red-700/50">
        Error loading interest conversion: {error}
      </div>
    )
  }

  const getBarColor = (conversionRate) => {
    if (conversionRate >= 70) return "#10b981" // green
    if (conversionRate >= 40) return "#f59e0b" // amber
    if (conversionRate >= 15) return "#3b82f6" // blue
    return "#ef4444" // red
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 shadow-lg">
          <p className="text-slate-200 font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-slate-300">
              Total Users: <span className="font-semibold text-white">{data.totalUsers}</span>
            </p>
            <p className="text-slate-300">
              Premium Users: <span className="font-semibold text-green-400">{data.premiumUsers}</span>
            </p>
            <p className="text-slate-300">
              Conversion Rate: <span className="font-semibold text-blue-400">{data.conversionRate.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const totalUsers = data.reduce((sum, item) => sum + item.totalUsers, 0)
  const totalPremium = data.reduce((sum, item) => sum + item.premiumUsers, 0)
  const overallConversion = totalUsers > 0 ? (totalPremium / totalUsers) * 100 : 0

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          Interest to Conversion Analysis
          <span className="ml-auto text-sm font-normal text-slate-400">Conversion by Interest Level</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="interestCategory"
                stroke="#9ca3af"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                label={{
                  value: "Conversion Rate (%)",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "#9ca3af" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="conversionRate" fill="#8884d8" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Bar key={`cell-${index}`} fill={getBarColor(entry.conversionRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Breakdown */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-medium">Conversion Breakdown</h4>
            {data.map((item, index) => (
              <div key={index} className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-200 font-medium text-sm">{item.interestCategory}</span>
                  <span className="font-bold text-lg" style={{ color: getBarColor(item.conversionRate) }}>
                    {item.conversionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{item.totalUsers} total users</span>
                  <span>{item.premiumUsers} premium users</span>
                </div>
                <div className="mt-2 bg-slate-600 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${item.conversionRate}%`,
                      backgroundColor: getBarColor(item.conversionRate),
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary & Insights */}
          <div className="space-y-4">
            <h4 className="text-slate-200 font-medium">Key Insights</h4>

            {/* Overall Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 text-sm">Total Users</span>
                </div>
                <p className="text-xl font-bold text-blue-400">{totalUsers}</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-300 text-sm">Overall Rate</span>
                </div>
                <p className="text-xl font-bold text-green-400">{overallConversion.toFixed(1)}%</p>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-slate-700/20 p-4 rounded-lg border border-slate-600/30">
              <div className="space-y-2 text-sm">
                <div className="text-slate-300">
                  <span className="text-green-400">Best Segment:</span>{" "}
                  {
                    data.reduce((max, item) => (item.conversionRate > max.conversionRate ? item : max), data[0])
                      ?.interestCategory
                  }{" "}
                  (
                  {data
                    .reduce((max, item) => (item.conversionRate > max.conversionRate ? item : max), data[0])
                    ?.conversionRate.toFixed(1)}
                  %)
                </div>
                <div className="text-slate-300">
                  <span className="text-amber-400">Opportunity:</span>{" "}
                  {data.find((item) => item.interestCategory === "Somewhat Interested")?.totalUsers || 0} users with
                  medium interest
                </div>
                <div className="text-slate-300">
                  <span className="text-blue-400">Win-back Potential:</span>{" "}
                  {data.find((item) => item.interestCategory === "Maybe Later")?.totalUsers || 0} users considering
                  later
                </div>
                <div className="text-slate-300">
                  <span className="text-red-400">Challenge:</span>{" "}
                  {data.find((item) => item.interestCategory === "Not Interested")?.totalUsers || 0} users not
                  interested
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
              <h5 className="text-purple-300 font-medium mb-2">Recommendations</h5>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Focus marketing on "Very Interested" segment (highest ROI)</li>
                <li>• Create targeted campaigns for "Somewhat Interested" users</li>
                <li>• Develop re-engagement strategy for "Maybe Later" segment</li>
                <li>• Analyze why "Not Interested" users aren't converting</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
