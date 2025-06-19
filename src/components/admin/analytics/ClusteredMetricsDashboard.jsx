"use client"

import { Users, Clock, Award, Target, TrendingUp } from "lucide-react"

export default function ClusteredMetricsDashboard({ data }) {
  // Add null check and default values
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="h-32 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  // Extract values with safe defaults
  const totalUsers = data?.totalUsers || 0
  const activeUsers = data?.activeUsers || 0
  const newUsers = data?.newUsersInPeriod || 0
  const totalAttempts = data?.totalAttempts || 0
  const averageTestScore = data?.averageTestScore || 0
  const averageTimePerTest = data?.averageTimePerTest || 0

  // Calculate percentages for circular progress
  const userEngagementRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
  const performanceRate = Math.round(averageTestScore)

  // Convert minutes to hours with proper formatting
  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return "N/A"

    const hours = minutes / 60
    if (hours < 1) {
      return `${minutes}m`
    } else if (hours < 10) {
      return `${hours.toFixed(1)}h`
    } else {
      return `${Math.round(hours)}h`
    }
  }

  // User metrics data
  const userMetrics = {
    total: totalUsers,
    active: activeUsers,
    new: newUsers,
    engagementRate: userEngagementRate,
  }

  // Performance metrics data
  const performanceMetrics = {
    attempts: totalAttempts,
    avgScore: Math.round(averageTestScore),
    avgTime: formatTime(averageTimePerTest),
    performanceRate: performanceRate,
  }

  // SVG Circle component for progress rings
  const CircularProgress = ({ percentage, size = 200, strokeWidth = 8, color = "#3b82f6" }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* User Analytics Cluster */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">User Analytics</h3>
              <p className="text-sm text-slate-400">Community engagement overview</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Circular Progress for User Engagement */}
          <div className="relative">
            <CircularProgress percentage={userEngagementRate} size={180} color="#3b82f6" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-white">{userMetrics.total}</div>
              <div className="text-sm text-slate-400">Total Users</div>
              <div className="text-xs text-blue-400 mt-1">{userEngagementRate}% Active</div>
            </div>
          </div>

          {/* User Breakdown Cards */}
          <div className="space-y-4 ml-8">
            <div className="bg-slate-700/30 rounded-lg p-4 min-w-[140px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Active</span>
                <Target className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{userMetrics.active}</div>
              <div className="text-xs text-green-400">Recent activity</div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 min-w-[140px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">New</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{userMetrics.new}</div>
              <div className="text-xs text-purple-400">This period</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analytics Cluster */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Award className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Performance Analytics</h3>
              <p className="text-sm text-slate-400">Test performance overview</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Circular Progress for Performance */}
          <div className="relative">
            <CircularProgress percentage={performanceRate} size={180} color="#10b981" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-white">{performanceMetrics.attempts}</div>
              <div className="text-sm text-slate-400">Total Attempts</div>
              <div className="text-xs text-emerald-400 mt-1">{performanceMetrics.avgScore}% Avg Score</div>
            </div>
          </div>

          {/* Performance Breakdown Cards */}
          <div className="space-y-4 ml-8">
            <div className="bg-slate-700/30 rounded-lg p-4 min-w-[140px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Avg Score</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{performanceMetrics.avgScore}%</div>
              <div className="text-xs text-amber-400">Overall performance</div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 min-w-[140px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Avg Time</span>
                <Clock className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">{performanceMetrics.avgTime}</div>
              <div className="text-xs text-orange-400">Per attempt</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
