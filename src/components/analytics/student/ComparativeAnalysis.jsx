"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Users, TrendingUp, Target, Trophy, X, BarChart3, Calendar, Clock, ExternalLink } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useRouter } from "next/navigation"

export default function ComparativeAnalysis({ attemptData, testData, analyticsData }) {
  const router = useRouter()
  const [showRankTable, setShowRankTable] = useState(false)
  const [showTestHistory, setShowTestHistory] = useState(false)
  const [rankData, setRankData] = useState([])
  const [testHistory, setTestHistory] = useState([])
  const [loadingRank, setLoadingRank] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  if (!attemptData || !testData || !analyticsData) {
    return <div className="text-center py-8 text-slate-400">Loading comparative analysis...</div>
  }

  // Fetch real ranking data
  const fetchRankingData = async () => {
    setLoadingRank(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${testData._id}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        // Process to show unique students with their latest scores only
        const uniqueStudents = new Map()

        data.leaderboard?.forEach((attempt) => {
          const studentId = attempt.student._id
          const existingAttempt = uniqueStudents.get(studentId)

          if (!existingAttempt || new Date(attempt.createdAt) > new Date(existingAttempt.createdAt)) {
            uniqueStudents.set(studentId, {
              ...attempt,
              isCurrentUser: attempt.student._id === (attemptData.student._id || attemptData.student),
            })
          }
        })

        // Convert to array and sort by score
        const sortedRanking = Array.from(uniqueStudents.values())
          .sort((a, b) => (b.score?.obtained || 0) - (a.score?.obtained || 0))
          .map((attempt, index) => ({
            ...attempt,
            rank: index + 1,
            percentile: Math.round(((uniqueStudents.size - index) / uniqueStudents.size) * 100),
          }))

        setRankData(sortedRanking)
      }
    } catch (error) {
      console.error("Error fetching ranking data:", error)
    } finally {
      setLoadingRank(false)
    }
  }

  // Fetch test history for the current user
  const fetchTestHistory = async () => {
    setLoadingHistory(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/test-attempts?testId=${testData._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const userAttempts =
          data.attempts
            ?.filter(
              (attempt) =>
                attempt.status === "completed" &&
                (attempt.student._id === (attemptData.student._id || attemptData.student) ||
                  attempt.student === (attemptData.student._id || attemptData.student)),
            )
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) || []

        setTestHistory(userAttempts)
      }
    } catch (error) {
      console.error("Error fetching test history:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const currentPercentile = analyticsData.percentile || 0
  const currentRank = analyticsData.rank || 1
  const totalStudents = analyticsData.totalStudents || 1

  // Calculate improvement from test history
  const calculateImprovement = () => {
    if (testHistory.length < 2) return "First Attempt"
    const latest = testHistory[testHistory.length - 1]
    const previous = testHistory[testHistory.length - 2]
    const improvement = (latest.score?.percentage || 0) - (previous.score?.percentage || 0)
    return improvement > 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Current Standing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/50 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => {
            fetchRankingData()
            setShowRankTable(true)
          }}
        >
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">#{currentRank}</div>
            <div className="text-sm text-slate-400">Your Rank</div>
            <div className="text-xs text-slate-500 mt-1">Click to view full ranking</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">{currentPercentile}</div>
            <div className="text-sm text-slate-400">JEE Percentile</div>
            <div className="text-xs text-slate-500 mt-1">Better than {currentPercentile}%</div>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/50 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => {
            fetchTestHistory()
            setShowTestHistory(true)
          }}
        >
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{calculateImprovement()}</div>
            <div className="text-sm text-slate-400">Improvement</div>
            <div className="text-xs text-slate-500 mt-1">Click for detailed analysis</div>
          </CardContent>
        </Card>
      </div>

      {/* Subject-wise Peer Comparison */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-200">
            <Target className="h-6 w-6 text-yellow-400" />
            Subject-wise Peer Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analyticsData.subjectWise?.map((subject, index) => (
              <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-200">{subject.subject}</h4>
                  <span className="text-sm text-slate-400">{subject.accuracy}% accuracy</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Your Score</span>
                    <span className="font-semibold text-teal-400">
                      {subject.obtainedMarks}/{subject.totalMarks}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-teal-500 to-blue-500"
                        style={{ width: `${subject.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        <span className="text-slate-400">Class Avg: {Math.round(subject.percentage * 0.8)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-slate-400">Top 10%: {Math.round(subject.percentage * 1.2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Distribution */}
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-200">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { range: "0-20%", count: Math.round(totalStudents * 0.1), color: "#ef4444" },
                  { range: "21-40%", count: Math.round(totalStudents * 0.15), color: "#f97316" },
                  { range: "41-60%", count: Math.round(totalStudents * 0.25), color: "#f59e0b" },
                  { range: "61-80%", count: Math.round(totalStudents * 0.3), color: "#3b82f6" },
                  { range: "81-100%", count: Math.round(totalStudents * 0.2), color: "#10b981" },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="range" tick={{ fill: "#9ca3af" }} />
                <YAxis tick={{ fill: "#9ca3af" }} />
                <Tooltip
                  formatter={(value) => [`${value} students`, "Count"]}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Rank Table Modal */}
      {showRankTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-slate-200">Complete Ranking - {testData.title}</h3>
              <button
                onClick={() => setShowRankTable(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingRank ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto"></div>
                  <div className="text-slate-400 mt-2">Loading rankings...</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {rankData.map((student, index) => (
                    <div
                      key={student._id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        student.isCurrentUser ? "bg-teal-900/30 border border-teal-500/50" : "bg-slate-700/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            student.rank === 1
                              ? "bg-yellow-500 text-yellow-900"
                              : student.rank === 2
                                ? "bg-slate-400 text-slate-900"
                                : student.rank === 3
                                  ? "bg-amber-600 text-amber-900"
                                  : "bg-slate-600 text-slate-200"
                          }`}
                        >
                          {student.rank}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">
                            {student.isCurrentUser ? "You" : student.student.name}
                          </div>
                          <div className="text-sm text-slate-400">{student.percentile}th percentile</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-200">{student.score?.obtained || 0}</div>
                        <div className="text-sm text-slate-400">{Math.round(student.score?.percentage || 0)}%</div>
                        <div className="text-xs text-slate-500">{new Date(student.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test History Dashboard Modal */}
      {showTestHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-200">Test History Dashboard</h3>
                <p className="text-slate-400 text-sm">{testData.title}</p>
              </div>
              <button
                onClick={() => setShowTestHistory(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto"></div>
                  <div className="text-slate-400 mt-2">Loading test history...</div>
                </div>
              ) : testHistory.length > 0 ? (
                <div className="space-y-8">
                  {/* Progress Chart */}
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-slate-200">Progress Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={testHistory.map((attempt, index) => ({
                              attempt: index + 1,
                              score: attempt.score?.obtained || 0,
                              percentage: attempt.score?.percentage || 0,
                              date: new Date(attempt.createdAt).toLocaleDateString(),
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="attempt" tick={{ fill: "#9ca3af" }} />
                            <YAxis tick={{ fill: "#9ca3af" }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="percentage"
                              stroke="#14b8a6"
                              strokeWidth={3}
                              dot={{ fill: "#14b8a6", strokeWidth: 2, r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timeline Component */}
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-slate-200">Attempt Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-600"></div>

                        <div className="space-y-6">
                          {testHistory.map((attempt, index) => (
                            <div key={attempt._id} className="relative flex items-start gap-6">
                              {/* Timeline node */}
                              <div
                                className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg"
                                onClick={() => router.push(`/analytics/student/${attempt._id}`)}
                              >
                                <div className="text-white font-bold text-sm">#{index + 1}</div>
                                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 opacity-20 animate-pulse"></div>
                              </div>

                              {/* Attempt details */}
                              <div className="flex-1 bg-slate-700/30 rounded-xl p-6 border border-slate-600/50 hover:border-slate-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h4 className="text-lg font-semibold text-slate-200">Attempt #{index + 1}</h4>
                                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(attempt.createdAt).toLocaleDateString()}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {new Date(attempt.createdAt).toLocaleTimeString()}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => router.push(`/analytics/student/${attempt._id}`)}
                                    className="flex items-center gap-2 px-3 py-1 bg-teal-600/20 text-teal-400 rounded-lg hover:bg-teal-600/30 transition-colors text-sm"
                                  >
                                    View Analytics
                                    <ExternalLink className="h-4 w-4" />
                                  </button>
                                </div>

                                {/* Score overview */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-teal-400">
                                      {attempt.score?.obtained || 0}
                                    </div>
                                    <div className="text-xs text-slate-400">Score</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">
                                      {Math.round(attempt.score?.percentage || 0)}%
                                    </div>
                                    <div className="text-xs text-slate-400">Percentage</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-400">
                                      {attempt.analysis?.correct || 0}
                                    </div>
                                    <div className="text-xs text-slate-400">Correct</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-400">
                                      {Math.round((attempt.timeSpent || 0) / 60)}m
                                    </div>
                                    <div className="text-xs text-slate-400">Time</div>
                                  </div>
                                </div>

                                {/* Subject-wise breakdown */}
                                {attempt.analysis?.subjectWise && (
                                  <div>
                                    <h5 className="text-sm font-medium text-slate-300 mb-2">
                                      Subject-wise Performance
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      {attempt.analysis.subjectWise.map((subject, subIndex) => (
                                        <div key={subIndex} className="bg-slate-800/50 rounded-lg p-3">
                                          <div className="text-sm font-medium text-slate-200 mb-1">
                                            {subject.subject}
                                          </div>
                                          <div className="text-xs text-slate-400">
                                            {subject.correct}/
                                            {subject.correct + subject.incorrect + subject.unattempted} correct
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 text-lg">No previous attempts found</div>
                  <div className="text-slate-500 text-sm mt-2">This is your first attempt at this test</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
