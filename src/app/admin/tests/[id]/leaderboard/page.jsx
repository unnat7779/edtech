"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

export default function TestLeaderboardPage({ params }) {
  const router = useRouter()
  const [test, setTest] = useState(null)
  const [testId, setTestId] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})

  useEffect(() => {
    const resolvedParams = Promise.resolve(params)
    resolvedParams.then((p) => {
      setTestId(p.id)
      fetchLeaderboard(p.id)
    })
  }, [params])

  const fetchLeaderboard = async (id) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tests/${id}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (response.ok) {
        setTest(data.test)
        setLeaderboard(data.leaderboard)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Leaderboard</h1>
            <p className="text-gray-600">{test?.title}</p>
          </div>
          <Button onClick={() => router.push(`/admin/tests/${testId}`)} variant="outline">
            Back to Test
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalAttempts || 0}</div>
              <div className="text-sm text-gray-600">Total Attempts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.averageScore?.toFixed(1) || 0}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.highestScore?.toFixed(1) || 0}%</div>
              <div className="text-sm text-gray-600">Highest Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.completionRate?.toFixed(1) || 0}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Rank</th>
                      <th className="text-left py-3 px-4">Student Name</th>
                      <th className="text-left py-3 px-4">Class</th>
                      <th className="text-left py-3 px-4">Score</th>
                      <th className="text-left py-3 px-4">Percentage</th>
                      <th className="text-left py-3 px-4">Time Taken</th>
                      <th className="text-left py-3 px-4">Attempt Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr key={entry._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {index < 3 && (
                              <span className="mr-2">
                                {index === 0 && "🥇"}
                                {index === 1 && "🥈"}
                                {index === 2 && "🥉"}
                              </span>
                            )}
                            <span className="font-medium">#{index + 1}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{entry.student.name}</td>
                        <td className="py-3 px-4">{entry.student.class}</td>
                        <td className="py-3 px-4">
                          {entry.score.obtained}/{entry.score.total}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-medium ${
                              entry.score.percentage >= 80
                                ? "text-green-600"
                                : entry.score.percentage >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {entry.score.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {Math.floor(entry.timeSpent / 60)}m {entry.timeSpent % 60}s
                        </td>
                        <td className="py-3 px-4">{new Date(entry.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No attempts yet for this test</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
