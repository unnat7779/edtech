"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

const AdminProgressChart = ({ progressData, studentName = "Student" }) => {
  console.log("🎯 AdminProgressChart received data:", progressData)

  // Transform the progress data for the chart
  const chartData = progressData?.trendData || []

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="text-center text-slate-400 flex flex-col items-center justify-center h-64">
          <svg
            className="h-12 w-12 mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 8v4l3 3"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          <p>No progress data available</p>
          <p className="text-sm mt-2">Complete some tests to see progress!</p>
        </div>
      </div>
    )
  }

  // --- ENHANCED RETAKE DETECTION LOGIC ---
  console.log("📊 Starting enhanced retake detection process...")
  console.log("📋 Raw chart data:", chartData)

  // 1. Prepare data with better test identification
  const processedData = chartData.map((item, index) => {
    let rawScore = 0
    if (item.rawScore !== undefined) {
      rawScore = item.rawScore
    } else if (item.score && typeof item.score === "object" && item.score.obtained !== undefined) {
      rawScore = item.score.obtained
    } else if (typeof item.score === "number") {
      rawScore = item.score
    } else if (item.y !== undefined) {
      rawScore = item.y
    }

    // Try multiple ways to get test identifier
    let testId = null
    let testTitle = null

    if (item.testId) {
      testId = item.testId.toString()
    } else if (item.test?._id) {
      testId = item.test._id.toString()
    } else if (item.test?.id) {
      testId = item.test.id.toString()
    }

    if (item.testTitle) {
      testTitle = item.testTitle
    } else if (item.testName) {
      testTitle = item.testName
    } else if (item.test?.title) {
      testTitle = item.test.title
    } else if (item.test?.name) {
      testTitle = item.test.name
    }

    // If no testId, use testTitle as identifier
    if (!testId && testTitle) {
      testId = testTitle
    }

    const attemptDate = new Date(item.date || item.createdAt)

    console.log(`📋 Processing item ${index + 1}:`, {
      testId,
      testTitle,
      rawScore,
      date: attemptDate,
      originalItem: item,
    })

    return {
      ...item,
      index,
      rawScore,
      testId,
      testTitle,
      date: attemptDate,
    }
  })

  // 2. Sort by date to ensure chronological order (CRITICAL for retake detection)
  processedData.sort((a, b) => a.date - b.date)
  console.log(
    "📅 Data sorted chronologically:",
    processedData.map((item) => ({ testId: item.testId, date: item.date })),
  )

  // 3. Enhanced retake detection using test identifiers
  const testAttemptTracker = new Map() // Track: testId -> { count, firstDate }

  const formattedData = processedData.map((item, index) => {
    const testId = item.testId
    let isRetake = false
    let attemptNumber = 1

    if (testId) {
      if (testAttemptTracker.has(testId)) {
        // We've seen this test before - this is a retake
        const tracker = testAttemptTracker.get(testId)
        isRetake = true
        attemptNumber = tracker.count + 1
        testAttemptTracker.set(testId, {
          count: attemptNumber,
          firstDate: tracker.firstDate,
        })
        console.log(`🟡 RETAKE DETECTED: Test "${testId}", Attempt #${attemptNumber}`)
      } else {
        // First time seeing this test
        testAttemptTracker.set(testId, {
          count: 1,
          firstDate: item.date,
        })
        console.log(`🟢 FIRST ATTEMPT: Test "${testId}"`)
      }
    } else {
      console.log(`⚠️ No testId found for item ${index + 1}, treating as unique test`)
    }

    return {
      x: index + 1,
      y: Math.round(item.rawScore * 100) / 100,
      date: item.date.toLocaleDateString(),
      testTitle: item.testTitle || `Test ${index + 1}`,
      subject: item.subject || "General",
      isRetake,
      attemptNumber,
      testId,
      score: item.score,
      timeSpent: item.timeSpent,
    }
  })

  console.log("📈 Final formatted data with retake detection:")
  formattedData.forEach((item, index) => {
    console.log(
      `  ${index + 1}. ${item.testTitle} - ${item.isRetake ? "🟡 RETAKE" : "🟢 FIRST"} (Attempt #${item.attemptNumber})`,
    )
  })

  // Calculate average score for reference line
  const averageScore =
    formattedData.length > 0 ? formattedData.reduce((sum, item) => sum + item.y, 0) / formattedData.length : 0

  console.log(`📊 Average score calculated: ${averageScore.toFixed(2)}`)

  // Custom tooltip - shows retake status clearly
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl">
          <div className="space-y-2">
            <div className="font-semibold text-slate-200">{data.testTitle}</div>
            <div className="text-sm text-slate-400">
              {data.isRetake ? (
                <span className="text-yellow-400">Attempt #{data.attemptNumber}</span>
              ) : (
                <span className="text-green-400">First Attempt</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Score: {data.y.toFixed(1)} marks</span>
            </div>
            {data.timeSpent !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-slate-300">
                  Time: {Math.floor(data.timeSpent / 60)}m {data.timeSpent % 60}s
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-slate-300">{data.date}</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 px-2 py-1 bg-slate-700/50 rounded">Subject: {data.subject}</div>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom Dot - GREEN for first attempts, YELLOW for retakes
  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    const dotColor = payload.isRetake ? "#eab308" : "#10b981" // Yellow for retakes, Green for first attempts

    return (
      <g>
        {/* Outer glow ring */}
        <circle cx={cx} cy={cy} r={6} fill="none" stroke={dotColor} strokeWidth={2} opacity={0.3} />
        {/* Main dot */}
        <circle cx={cx} cy={cy} r={4} fill={dotColor} stroke="#1e293b" strokeWidth={2} />
        {/* Inner highlight */}
        <circle cx={cx} cy={cy} r={1.5} fill="#ffffff" opacity={0.8} />
      </g>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-2">Performance Progress</h3>
        {/* <p className="text-slate-400 text-sm">
          Track {studentName}'s test scores over time. Green dots are first attempts, yellow dots are retakes.
        </p> */}
      </div>

      {/* Chart */}
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="x"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Test Attempts",
                  position: "insideBottom",
                  offset: -10,
                  style: { fill: "#9ca3af" },
                }}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 2", "dataMax + 2"]}
                label={{
                  value: "Score (Marks)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#9ca3af" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={averageScore} stroke="#6366f1" strokeDasharray="5 5" opacity={0.6} />
              <Line
                type="monotone"
                dataKey="y"
                stroke="url(#progressGradient)"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "#ffffff" }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-sm text-slate-400">First Attempt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-sm text-slate-400">Retake</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-0.5 bg-purple-400 opacity-60"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, transparent, transparent 3px, #a855f7 3px, #a855f7 6px)",
              }}
            ></div>
            <span className="text-sm text-slate-400">Average Score</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProgressChart
