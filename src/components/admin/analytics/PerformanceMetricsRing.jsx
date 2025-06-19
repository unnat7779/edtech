"use client"

import { Award, Clock, Target } from "lucide-react"
import { useState, useEffect } from "react"

export default function PerformanceMetricsRing({ data }) {
  const [animatedValues, setAnimatedValues] = useState({
    attempts: 0,
    avgScore: 0,
    avgTime: 0,
  })

  // Safe data extraction
  const totalAttempts = data?.totalAttempts || 0
  const averageTestScore = data?.averageTestScore || 0
  const averageTimePerTest = data?.averageTimePerTest || 0

  // Convert time to display format
  const formatTime = (minutes) => {
    if (!minutes || minutes === 0) return "0m"
    const hours = minutes / 60
    if (hours < 1) {
      return `${Math.round(minutes)}m`
    } else if (hours < 10) {
      return `${hours.toFixed(1)}h`
    } else {
      return `${Math.round(hours)}h`
    }
  }

  // Calculate percentages for ring segments (normalized to 100)
  const maxAttempts = Math.max(totalAttempts, 100) // Normalize base
  const maxScore = 100
  const maxTime = Math.max(averageTimePerTest, 60) // Normalize to 60 minutes max

  const attemptsPercentage = (totalAttempts / maxAttempts) * 100
  const scorePercentage = (averageTestScore / maxScore) * 100
  const timePercentage = (averageTimePerTest / maxTime) * 100

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        attempts: totalAttempts,
        avgScore: Math.round(averageTestScore),
        avgTime: averageTimePerTest,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [totalAttempts, averageTestScore, averageTimePerTest])

  // Segmented Ring Component
  const PerformanceRing = ({ size = 200, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI

    // Calculate segment lengths (each takes 1/3 of the circle with gaps)
    const segmentLength = (circumference - 12) / 3 // 3 segments with 4px gaps each
    const gap = 4

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

          {/* Attempts segment (blue) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${(attemptsPercentage / 100) * segmentLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Score segment (green) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10b981"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${(scorePercentage / 100) * segmentLength} ${circumference}`}
            strokeDashoffset={-(segmentLength + gap)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out delay-200"
          />

          {/* Time segment (amber) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${(timePercentage / 100) * segmentLength} ${circumference}`}
            strokeDashoffset={-(segmentLength * 2 + gap * 2)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out delay-400"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-white transition-all duration-1000">{animatedValues.attempts}</div>
          <div className="text-sm text-slate-400 mt-1">Attempts</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-emerald-500/20 rounded-xl">
          <Award className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Performance Analytics</h3>
          <p className="text-sm text-slate-400">Test performance overview</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Main Ring */}
        <div className="flex flex-col items-center">
          <PerformanceRing size={200} strokeWidth={12} />

          {/* Bottom metrics */}
          <div className="flex items-center space-x-6 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-300">{animatedValues.avgScore}% Avg</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-300">{formatTime(animatedValues.avgTime)}</span>
            </div>
          </div>
        </div>

        {/* Side Cards */}
        <div className="space-y-4 ml-8">
          {/* Total Attempts Card */}
          <div className="bg-slate-700/30 rounded-lg p-4 min-w-[140px] border border-blue-500/30 hover:border-blue-400/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Attempts</span>
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{animatedValues.attempts}</div>
            <div className="text-xs text-blue-400">Total tests</div>
          </div>

          {/* Average Score Card */}
          <div className="bg-slate-700/30 rounded-lg p-4 min-w-[140px] border border-emerald-500/30 hover:border-emerald-400/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Avg. Score</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{animatedValues.avgScore}%</div>
            <div className="text-xs text-emerald-400">Performance</div>
          </div>

          {/* Average Time Card */}
          <div className="bg-slate-700/30 rounded-lg p-4 min-w-[140px] border border-amber-500/30 hover:border-amber-400/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Avg. Time</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">{formatTime(animatedValues.avgTime)}</div>
            <div className="text-xs text-amber-400">Per test</div>
          </div>
        </div>
      </div>
    </div>
  )
}
