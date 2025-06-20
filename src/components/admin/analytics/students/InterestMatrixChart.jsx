"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Grid3X3, TrendingUp, Users } from "lucide-react"

export default function InterestMatrixChart() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/analytics/students/interest-matrix", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        throw new Error("Failed to fetch interest matrix data")
      }
    } catch (error) {
      console.error("Error fetching interest matrix:", error)
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
        Error loading interest matrix: {error}
      </div>
    )
  }

  const getCellColor = (category, interest) => {
    const colors = {
      active: {
        interested: "bg-green-500/80 text-white border-green-400",
        not_interested: "bg-yellow-500/80 text-white border-yellow-400",
        unknown: "bg-blue-500/80 text-white border-blue-400",
      },
      inactive: {
        interested: "bg-orange-500/80 text-white border-orange-400",
        not_interested: "bg-red-500/80 text-white border-red-400",
        unknown: "bg-gray-500/80 text-white border-gray-400",
      },
    }
    return colors[category]?.[interest] || "bg-gray-500/50 text-gray-300 border-gray-500"
  }

  const getEmoji = (category, interest) => {
    const emojis = {
      active: {
        interested: "🟢",
        not_interested: "🟡",
        unknown: "🔵",
      },
      inactive: {
        interested: "🟠",
        not_interested: "🔴",
        unknown: "⚫",
      },
    }
    return emojis[category]?.[interest] || "⚪"
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-purple-400" />
          User Interest Heatmap Matrix
          <span className="ml-auto text-sm font-normal text-slate-400">Activity vs Interest</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 text-slate-300 font-medium border-b border-slate-700"></th>
                <th className="text-center p-4 text-slate-300 font-medium border-b border-slate-700">Interested</th>
                <th className="text-center p-4 text-slate-300 font-medium border-b border-slate-700">Not Interested</th>
                <th className="text-center p-4 text-slate-300 font-medium border-b border-slate-700">Unknown</th>
                <th className="text-center p-4 text-slate-300 font-medium border-b border-slate-700">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50">
                <td className="p-4 text-slate-300 font-medium">Active Users</td>
                <td className="p-2">
                  <div className={`rounded-lg p-4 text-center border-2 ${getCellColor("active", "interested")}`}>
                    <div className="text-2xl mb-1">{getEmoji("active", "interested")}</div>
                    <div className="text-xl font-bold">{data.matrix.active.interested.count}</div>
                    <div className="text-sm opacity-90">{data.matrix.active.interested.percentage}%</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className={`rounded-lg p-4 text-center border-2 ${getCellColor("active", "not_interested")}`}>
                    <div className="text-2xl mb-1">{getEmoji("active", "not_interested")}</div>
                    <div className="text-xl font-bold">{data.matrix.active.not_interested.count}</div>
                    <div className="text-sm opacity-90">{data.matrix.active.not_interested.percentage}%</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className={`rounded-lg p-4 text-center border-2 ${getCellColor("active", "unknown")}`}>
                    <div className="text-2xl mb-1">{getEmoji("active", "unknown")}</div>
                    <div className="text-xl font-bold">{data.matrix.active.unknown.count}</div>
                    <div className="text-sm opacity-90">{data.matrix.active.unknown.percentage}%</div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="text-xl font-bold text-slate-200">{data.totals.active}</div>
                  <div className="text-sm text-slate-400">users</div>
                </td>
              </tr>
              <tr>
                <td className="p-4 text-slate-300 font-medium">Inactive Users</td>
                <td className="p-2">
                  <div className={`rounded-lg p-4 text-center border-2 ${getCellColor("inactive", "interested")}`}>
                    <div className="text-2xl mb-1">{getEmoji("inactive", "interested")}</div>
                    <div className="text-xl font-bold">{data.matrix.inactive.interested.count}</div>
                    <div className="text-sm opacity-90">{data.matrix.inactive.interested.percentage}%</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className={`rounded-lg p-4 text-center border-2 ${getCellColor("inactive", "not_interested")}`}>
                    <div className="text-2xl mb-1">{getEmoji("inactive", "not_interested")}</div>
                    <div className="text-xl font-bold">{data.matrix.inactive.not_interested.count}</div>
                    <div className="text-sm opacity-90">{data.matrix.inactive.not_interested.percentage}%</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className={`rounded-lg p-4 text-center border-2 ${getCellColor("inactive", "unknown")}`}>
                    <div className="text-2xl mb-1">{getEmoji("inactive", "unknown")}</div>
                    <div className="text-xl font-bold">{data.matrix.inactive.unknown.count}</div>
                    <div className="text-sm opacity-90">{data.matrix.inactive.unknown.percentage}%</div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="text-xl font-bold text-slate-200">{data.totals.inactive}</div>
                  <div className="text-sm text-slate-400">users</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
          <h4 className="text-slate-200 font-medium mb-3">Legend & Insights</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🟢</span>
              <span className="text-green-400">High Priority:</span>
              <span className="text-slate-300">Active + Interested</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🟡</span>
              <span className="text-yellow-400">Re-engage:</span>
              <span className="text-slate-300">Active + Not Interested</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🟠</span>
              <span className="text-orange-400">Win Back:</span>
              <span className="text-slate-300">Inactive + Interested</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔴</span>
              <span className="text-red-400">Low Priority:</span>
              <span className="text-slate-300">Inactive + Not Interested</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔵</span>
              <span className="text-blue-400">Survey Needed:</span>
              <span className="text-slate-300">Active + Unknown Interest</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚫</span>
              <span className="text-gray-400">Dormant:</span>
              <span className="text-slate-300">Inactive + Unknown</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-green-300 text-sm">High Priority</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{data.matrix.active.interested.count}</p>
            <p className="text-green-300 text-xs">Active + Interested</p>
          </div>
          <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-400" />
              <span className="text-orange-300 text-sm">Win Back</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{data.matrix.inactive.interested.count}</p>
            <p className="text-orange-300 text-xs">Inactive + Interested</p>
          </div>
          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 text-sm">Survey Needed</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{data.matrix.active.unknown.count}</p>
            <p className="text-blue-300 text-xs">Active + Unknown</p>
          </div>
          <div className="bg-slate-500/10 p-3 rounded-lg border border-slate-500/20">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-slate-300 text-sm">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-slate-400">{data.totals.total}</p>
            <p className="text-slate-300 text-xs">All segments</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
