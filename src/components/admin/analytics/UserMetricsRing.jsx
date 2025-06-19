"use client"

import { Users, Target, TrendingUp, UserPlus } from "lucide-react"
import { useState, useEffect } from "react"

export default function UserMetricsRing({ data }) {
  const [animatedValues, setAnimatedValues] = useState({
    total: 0,
    active: 0,
    new: 0,
  })

  // Safe data extraction
  const totalUsers = data?.totalUsers || 0
  const activeUsers = data?.activeUsers || 0
  const newUsers = data?.newUsersInPeriod || 0

  // Calculate percentages for ring segments
  const totalValue = totalUsers
  const activePercentage = totalValue > 0 ? (activeUsers / totalValue) * 100 : 0
  const newPercentage = totalValue > 0 ? (newUsers / totalValue) * 100 : 0
  const existingPercentage = 100 - activePercentage - newPercentage

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [totalUsers, activeUsers, newUsers])

  // Segmented Ring Component
  const SegmentedRing = ({ size = 200, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI

    // Calculate segment lengths
    const existingLength = (existingPercentage / 100) * circumference
    const activeLength = (activePercentage / 100) * circumference
    const newLength = (newPercentage / 100) * circumference

    const gap = 4 // Gap between segments

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

          {/* Existing users segment (gray-blue) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#64748b"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${existingLength} ${circumference - existingLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Active users segment (blue) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${activeLength} ${circumference - activeLength}`}
            strokeDashoffset={-(existingLength + gap)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out delay-200"
          />

          {/* New users segment (purple) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#8b5cf6"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${newLength} ${circumference - newLength}`}
            strokeDashoffset={-(existingLength + activeLength + gap * 2)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out delay-400"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-white transition-all duration-1000">{animatedValues.total}</div>
          <div className="text-sm text-slate-400 mt-1">Users</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">User Analytics</h3>
          <p className="text-sm text-slate-400">Community engagement overview</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Main Ring */}
        <div className="flex flex-col items-center">
          <SegmentedRing size={200} strokeWidth={12} />

          {/* Bottom metrics */}
          <div className="flex items-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">{animatedValues.active} Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-300">{animatedValues.new} New</span>
            </div>
          </div>
        </div>

        {/* Side Cards */}
        <div className="space-y-4 ml-8">
          {/* Total Users Card */}
          <div className="bg-slate-700/30 rounded-lg p-4 min-w-[140px] border border-slate-600/30 hover:border-slate-500/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Total</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-white">{animatedValues.total}</div>
            <div className="text-xs text-slate-500">All users</div>
          </div>

          {/* Active Users Card */}
          <div className="bg-slate-700/30 rounded-lg p-4 min-w-[140px] border border-blue-500/30 hover:border-blue-400/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Active</span>
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{animatedValues.active}</div>
            <div className="text-xs text-blue-400">Recent activity</div>
          </div>

          {/* New Users Card */}
          <div className="bg-slate-700/30 rounded-lg p-4 min-w-[140px] border border-purple-500/30 hover:border-purple-400/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">New</span>
              <UserPlus className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{animatedValues.new}</div>
            <div className="text-xs text-purple-400">This period</div>
          </div>
        </div>
      </div>
    </div>
  )
}
