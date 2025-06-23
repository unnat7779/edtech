"use client"

import { useState, useRef } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { LineChart, RefreshCw, Download, ZoomIn, ZoomOut } from "lucide-react"
import { useRetentionData } from "@/hooks/useRetentionData"

export default function RetentionLineChart({ timeRange = "30" }) {
  const [selectedMetrics, setSelectedMetrics] = useState(["retention7Day", "retention14Day", "retention30Day"])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const svgRef = useRef(null)

  const { data, loading, error, refresh } = useRetentionData(timeRange)

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-400" />
            Retention Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mb-4" />
            <p className="text-slate-400">Loading trend data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data || !data.trends) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-red-400" />
            Retention Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <LineChart className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-red-400 text-center mb-4">Error loading trend data</p>
            <Button onClick={refresh} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { trends } = data

  if (!trends || trends.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-400" />
            Retention Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <LineChart className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-400">No trend data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Chart configuration
  const chartWidth = 800 * zoomLevel
  const chartHeight = 300
  const padding = { top: 20, right: 50, bottom: 40, left: 50 }
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom

  // Data processing
  const metrics = [
    { key: "retention7", label: "7-day", color: "#10b981" },
    { key: "retention14", label: "14-day", color: "#f59e0b" },
    { key: "retention30", label: "30-day", color: "#ef4444" },
  ]

  const maxValue = Math.max(...trends.flatMap((point) => metrics.map((metric) => point[metric] || 0)))

  // Scale functions
  const xScale = (index) => padding.left + (index * plotWidth) / (trends.length - 1)
  const yScale = (value) => padding.top + plotHeight - (value * plotHeight) / Math.max(maxValue, 100)

  // Generate path for each metric
  const generatePath = (metricKey) => {
    const points = trends.map((point, index) => `${xScale(index)},${yScale(point[metricKey] || 0)}`)
    return `M ${points.join(" L ")}`
  }

  // Export chart as SVG
  const exportChart = () => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `retention-trends-${new Date().toISOString().split("T")[0]}.svg`
    link.click()
  }

  // Toggle metric visibility
  const toggleMetric = (metricKey) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricKey) ? prev.filter((m) => m !== metricKey) : [...prev, metricKey],
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-400" />
            Retention Trends
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <Button
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              size="sm"
              className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-200"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>

            <Button
              onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
              size="sm"
              className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-200"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>

            <Button onClick={refresh} size="sm" className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-200">
              <RefreshCw className="h-3 w-3" />
            </Button>

            <Button onClick={exportChart} size="sm" className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-200">
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Metric Toggles */}
        <div className="flex flex-wrap gap-2 mb-6">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium transition-all
                ${
                  selectedMetrics.includes(metric.key)
                    ? "text-white shadow-lg"
                    : "text-slate-400 bg-slate-700/30 hover:bg-slate-600/30"
                }
              `}
              style={{
                backgroundColor: selectedMetrics.includes(metric.key) ? metric.color : undefined,
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.color }}></div>
                {metric.label} retention
              </div>
            </button>
          ))}
        </div>

        {/* Chart Container */}
        <div className="overflow-x-auto">
          <div style={{ width: `${chartWidth}px`, height: `${chartHeight}px` }}>
            <svg ref={svgRef} width={chartWidth} height={chartHeight} className="bg-slate-900/20 rounded-lg">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />

              {/* Y-axis labels */}
              {[0, 25, 50, 75, 100].map((value) => (
                <g key={value}>
                  <line
                    x1={padding.left}
                    y1={yScale(value)}
                    x2={chartWidth - padding.right}
                    y2={yScale(value)}
                    stroke="#374151"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <text x={padding.left - 10} y={yScale(value) + 4} textAnchor="end" className="fill-slate-400 text-xs">
                    {value}%
                  </text>
                </g>
              ))}

              {/* X-axis labels */}
              {trends.map((point, index) => {
                if (index % Math.ceil(trends.length / 8) === 0) {
                  return (
                    <text
                      key={index}
                      x={xScale(index)}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      className="fill-slate-400 text-xs"
                    >
                      {new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </text>
                  )
                }
                return null
              })}

              {/* Trend Lines */}
              {metrics.map((metric) => {
                if (!selectedMetrics.includes(metric.key)) return null

                return (
                  <g key={metric.key}>
                    <path
                      d={generatePath(metric.key)}
                      fill="none"
                      stroke={metric.color}
                      strokeWidth="2"
                      className="hover:stroke-width-3 transition-all"
                    />

                    {/* Data Points */}
                    {trends.map((point, index) => (
                      <circle
                        key={index}
                        cx={xScale(index)}
                        cy={yScale(point[metric.key] || 0)}
                        r="3"
                        fill={metric.color}
                        className="hover:r-5 transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredPoint({ index, metric: metric.key, value: point[metric.key] })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </g>
                )
              })}

              {/* Tooltip */}
              {hoveredPoint && (
                <g>
                  <rect
                    x={xScale(hoveredPoint.index) - 40}
                    y={yScale(hoveredPoint.value) - 30}
                    width="80"
                    height="25"
                    fill="rgba(0, 0, 0, 0.8)"
                    rx="4"
                  />
                  <text
                    x={xScale(hoveredPoint.index)}
                    y={yScale(hoveredPoint.value) - 10}
                    textAnchor="middle"
                    className="fill-white text-xs"
                  >
                    {hoveredPoint.value}%
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const avgValue = trends.reduce((sum, point) => sum + (point[metric.key] || 0), 0) / trends.length
            const trend =
              trends.length > 1 ? (trends[trends.length - 1][metric.key] || 0) - (trends[0][metric.key] || 0) : 0

            return (
              <div key={metric.key} className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.color }}></div>
                  <span className="text-slate-400 text-xs">{metric.label}</span>
                </div>
                <div className="text-lg font-bold text-slate-200">{Math.round(avgValue)}%</div>
                <div className={`text-xs ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {trend >= 0 ? "+" : ""}
                  {Math.round(trend)}% trend
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
          <span>
            Showing {trends.length} data points over {timeRange} days
          </span>
          <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
        </div>
      </CardContent>
    </Card>
  )
}
