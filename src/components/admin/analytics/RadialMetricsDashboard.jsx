"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, UserPlus, FileText, Award, Clock, Target, BarChart2, ChevronRight, X } from "lucide-react"

export default function RadialMetricsDashboard({ data }) {
  const [activeMetric, setActiveMetric] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Format values with proper units
  const formatValue = (value, type) => {
    if (value === undefined || value === null) return "N/A"

    switch (type) {
      case "percentage":
        return `${Math.round(value)}%`
      case "time":
        return `${value}m`
      default:
        return value.toLocaleString()
    }
  }

  // Define metrics with their properties
  const metrics = [
    {
      id: "newUsers",
      title: "New Users",
      value: formatValue(data?.newUsersInPeriod || 0),
      icon: UserPlus,
      color: "rgb(255, 107, 107)",
      description: "Users registered in current period",
      angle: 60,
    },
    {
      id: "totalUsers",
      title: "Total Users",
      value: formatValue(data?.totalUsers || 0),
      icon: Users,
      color: "rgb(79, 192, 255)",
      description: "Total registered students",
      angle: 120,
    },
    {
      id: "totalAttempts",
      title: "Total Attempts",
      value: formatValue(data?.totalAttempts || 0),
      icon: FileText,
      color: "rgb(82, 221, 152)",
      description: "All test submissions",
      angle: 180,
    },
    {
      id: "averageScore",
      title: "Average Score",
      value: formatValue(data?.averageTestScore || 0, "percentage"),
      icon: Award,
      color: "rgb(171, 233, 121)",
      description: "Average performance across all tests",
      angle: 240,
    },
    {
      id: "averageTime",
      title: "Average Time/Test",
      value: formatValue(data?.averageTimePerTest || 0, "time"),
      icon: Clock,
      color: "rgb(255, 222, 89)",
      description: "Average time spent per test",
      angle: 300,
    },
    {
      id: "activeUsers",
      title: "Active Users",
      value: formatValue(data?.activeUsers || 0),
      icon: Target,
      color: "rgb(255, 159, 67)",
      description: "Users with recent activity",
      angle: 360,
    },
  ]

  const handleMetricClick = (metric) => {
    if (activeMetric === metric.id) {
      setActiveMetric(null)
      setIsExpanded(false)
    } else {
      setActiveMetric(metric.id)
      setIsExpanded(true)
    }
  }

  const getMetricDetails = () => {
    return metrics.find((m) => m.id === activeMetric)
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Main radial visualization */}
      <div className="relative aspect-square">
        {/* Center circle with dashboard icon */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center z-10"
          animate={{
            scale: isExpanded ? 0.8 : 1,
            opacity: isExpanded ? 0.7 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <BarChart2 className="w-8 h-8 text-blue-400" />
        </motion.div>

        {/* Metric sectors */}
        {metrics.map((metric, index) => {
          const isActive = activeMetric === metric.id

          return (
            <motion.div
              key={metric.id}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                transformOrigin: "center",
                transform: `rotate(${metric.angle - 60}deg)`,
              }}
            >
              <motion.div
                className={`
                  absolute top-1/2 left-1/2 w-[80%] h-[80%] 
                  cursor-pointer overflow-hidden
                `}
                style={{
                  transformOrigin: "0% 50%",
                  transform: "translate(-50%, -50%) rotate(0deg)",
                }}
                animate={{
                  scale: isActive ? 1.05 : 1,
                  zIndex: isActive ? 20 : 5,
                }}
                onClick={() => handleMetricClick(metric)}
              >
                {/* Sector shape */}
                <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full">
                  <path
                    d="M50,50 L50,0 A50,50 0 0,1 93.3,25 L50,50 Z"
                    fill={isActive ? `${metric.color}20` : "transparent"}
                    stroke={metric.color}
                    strokeWidth="1.5"
                    className={`
                      transition-all duration-300
                      ${isActive ? "opacity-100" : "opacity-70 hover:opacity-100"}
                    `}
                  />
                </svg>

                {/* Content positioning */}
                <div
                  className="absolute"
                  style={{
                    top: "30%",
                    left: "60%",
                    transform: `rotate(${-(metric.angle - 60)}deg)`,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full mb-2"
                    style={{ backgroundColor: `${metric.color}20` }}
                  >
                    <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                  </div>

                  {/* Value */}
                  <div className="text-2xl font-bold mb-1" style={{ color: metric.color }}>
                    {metric.value}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        })}

        {/* Metric labels */}
        {metrics.map((metric) => (
          <div
            key={`label-${metric.id}`}
            className="absolute text-white font-medium"
            style={{
              top: `${50 + 48 * Math.sin((metric.angle * Math.PI) / 180)}%`,
              left: `${50 + 48 * Math.cos((metric.angle * Math.PI) / 180)}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {metric.title}
          </div>
        ))}
      </div>

      {/* Expanded metric detail panel */}
      {activeMetric && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-xl p-6 shadow-xl"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="p-3 rounded-lg mr-4" style={{ backgroundColor: `${getMetricDetails().color}20` }}>
                {/* Fix: Use bracket notation to access the icon component */}
                {getMetricDetails().icon ? (
                  <getMetricDetails.icon className="w-6 h-6" style={{ color: getMetricDetails().color }} />
                ) : null}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{getMetricDetails().title}</h3>
                <p className="text-slate-400">{getMetricDetails().description}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveMetric(null)
                setIsExpanded(false)
              }}
              className="p-2 rounded-full hover:bg-slate-700/50"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-1">Current Value</div>
              <div className="text-3xl font-bold" style={{ color: getMetricDetails().color }}>
                {getMetricDetails().value}
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-1">View Details</div>
              <button
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => console.log(`Navigate to ${getMetricDetails().title} details`)}
              >
                Full Analytics <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
