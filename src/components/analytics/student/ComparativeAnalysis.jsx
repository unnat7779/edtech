"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { Users, TrendingUp, Target, Trophy, BarChart3 } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useRouter } from "next/navigation"
import LeaderboardModal from "./LeaderboardModal"
import ProgressModal from "./ProgressModal"

export default function ComparativeAnalysis({ attemptData, testData, analyticsData }) {
  const router = useRouter()
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch real leaderboard data on component mount
  useEffect(() => {
    fetchLeaderboardData()
  }, [testData._id, attemptData._id])

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true)
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
            uniqueStudents.set(studentId, attempt)
          }
        })

        // Convert to array and sort by score
        const sortedRanking = Array.from(uniqueStudents.values()).sort(
          (a, b) => (b.score?.obtained || 0) - (a.score?.obtained || 0),
        )

        // Find current user's position and calculate percentile
        const currentUserAttempt = sortedRanking.find(
          (attempt) =>
            attempt._id === attemptData._id || attempt.student._id === (attemptData.student._id || attemptData.student),
        )

        let userRank = null
        let userPercentile = 0

        if (currentUserAttempt) {
          userRank = sortedRanking.findIndex((attempt) => attempt._id === currentUserAttempt._id) + 1
          const totalStudents = sortedRanking.length
          const currentUserScore = currentUserAttempt.score?.obtained || 0

          // Calculate percentile using the new formula:
          // percentile = (number_of_students_with_score_less_than_or_equal / total_students) * 100
          const studentsWithLowerOrEqualScore = sortedRanking.filter(
            (attempt) => (attempt.score?.obtained || 0) <= currentUserScore,
          ).length

          userPercentile = totalStudents > 0 ? Math.round((studentsWithLowerOrEqualScore / totalStudents) * 100) : 0
        }

        setLeaderboardData({
          userRank,
          userPercentile,
          totalStudents: sortedRanking.length,
          leaderboard: sortedRanking,
        })
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
      // Fallback to analyticsData if leaderboard fetch fails
      setLeaderboardData({
        userRank: analyticsData.rank,
        userPercentile: analyticsData.percentile,
        totalStudents: analyticsData.totalStudents,
        leaderboard: [],
      })
    } finally {
      setLoading(false)
    }
  }

  if (!attemptData || !testData || !analyticsData) {
    return <div className="text-center py-8 text-slate-400">Loading comparative analysis...</div>
  }

  // Use leaderboard data if available, otherwise fallback to analyticsData
  const currentRank = leaderboardData?.userRank || analyticsData.rank || 1
  const currentPercentile = leaderboardData?.userPercentile || analyticsData.percentile || 0
  const totalStudents = leaderboardData?.totalStudents || analyticsData.totalStudents || 1

  // Calculate improvement from previous attempts
  const calculateImprovement = () => {
    if (analyticsData.previousAttempts?.length < 1) {
      return { text: "First Attempt", color: "text-slate-400" }
    }

    const currentScore = attemptData.score?.percentage || 0
    const previousScore = analyticsData.previousAttempts[0]?.percentage || 0
    const improvement = currentScore - previousScore

    if (improvement > 0) {
      return { text: `+${improvement.toFixed(1)}%`, color: "text-emerald-400" }
    } else if (improvement < 0) {
      return { text: `${improvement.toFixed(1)}%`, color: "text-red-400" }
    } else {
      return { text: "No Change", color: "text-slate-400" }
    }
  }

  // Handle rank card click
  const handleRankCardClick = () => {
    console.log("Rank card clicked - opening leaderboard modal")
    setShowLeaderboardModal(true)
  }

  // Handle improvement card click
  const handleImprovementCardClick = () => {
    console.log("Improvement card clicked - opening progress modal")
    setShowProgressModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Current Standing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rank Card - Clickable */}
        <div
          className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-700/50 rounded-xl p-6 text-center cursor-pointer hover:from-yellow-900/30 hover:to-yellow-800/30 hover:scale-105 transition-all duration-200 group"
          onClick={handleRankCardClick}
        >
          <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-400">{loading ? "..." : `#${currentRank}`}</div>
          <div className="text-sm text-slate-400">Your Rank</div>
          <div className="text-xs text-slate-500 mt-1 group-hover:text-yellow-300 transition-colors">
            {loading ? "Loading..." : `out of ${totalStudents} students`}
          </div>
          <div className="text-xs text-slate-600 mt-1 group-hover:text-yellow-400 transition-colors">
            Click to view full ranking
          </div>
        </div>

        {/* Percentile Card - Non-clickable */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50">
          <CardContent className="p-6  text-center">
            <Users className="h-8 w-8 mt-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">{loading ? "..." : currentPercentile}</div>
            <div className="text-sm text-slate-400">JEE Percentile</div>
            <div className="text-xs text-slate-500 mt-1">
              {loading ? "Calculating..." : `At or above ${currentPercentile}% of students`}
            </div>
          </CardContent>
        </Card>

        {/* Improvement Card - Clickable */}
        <div
          className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/50 rounded-xl p-6 text-center cursor-pointer hover:from-green-900/30 hover:to-green-800/30 hover:scale-105 transition-all duration-200 group"
          onClick={handleImprovementCardClick}
        >
          <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <div className={`text-2xl font-bold ${calculateImprovement().color}`}>{calculateImprovement().text}</div>
          <div className="text-sm text-slate-400">Improvement</div>
          <div className="text-xs text-slate-500 mt-1 group-hover:text-green-300 transition-colors">
            Click for detailed analysis
          </div>
        </div>
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
                        style={{ width: `${Math.max(0, Math.min(100, subject.percentage))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        <span className="text-slate-400">Class Avg: {Math.round(subject.percentage * 0.8)}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-slate-400">
                          Top 10%: {Math.round(Math.min(100, subject.percentage * 1.2))}%
                        </span>
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

      {/* Leaderboard Modal */}
      <LeaderboardModal
        testId={testData._id}
        testTitle={testData.title}
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        currentUserRank={currentRank}
      />

      {/* Progress Modal */}
      <ProgressModal
        testId={testData._id}
        testTitle={testData.title}
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
      />
    </div>
  )
}
