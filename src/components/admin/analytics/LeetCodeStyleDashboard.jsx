"use client"

import UserMetricsRing from "./UserMetricsRing"
import PerformanceMetricsRing from "./PerformanceMetricsRing"

export default function LeetCodeStyleDashboard({ data }) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="h-48 bg-slate-700 rounded"></div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="h-48 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <UserMetricsRing data={data} />
      <PerformanceMetricsRing data={data} />
    </div>
  )
}
