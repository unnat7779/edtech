"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"
import { BookOpen, TrendingUp, TrendingDown, Target, Brain, Info } from "lucide-react"

export default function SubjectTopicIntelligence({ testId, analyticsData, filters }) {
  const [subjectData, setSubjectData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Function to get authentication headers
  const getAuthHeaders = () => {
    try {
      // Try to get token from localStorage first
      let token = null

      if (typeof window !== "undefined") {
        token = localStorage.getItem("token")
        console.log("Token from localStorage:", token ? `${token.substring(0, 20)}...` : "null")

        // If no token in localStorage, try to get from cookies
        if (!token) {
          const cookies = document.cookie.split(";").reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split("=")
            acc[key] = value
            return acc
          }, {})
          token = cookies.token
          console.log("Token from cookies:", token ? `${token.substring(0, 20)}...` : "null")
        }
      }

      const headers = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`
        console.log("✅ Authorization header added")
      } else {
        console.warn("❌ No authentication token found")
      }

      return headers
    } catch (error) {
      console.error("Error getting auth headers:", error)
      return {
        "Content-Type": "application/json",
      }
    }
  }

  useEffect(() => {
    if (testId) {
      console.log("Effect triggered with testId:", testId)

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.error("Request timed out after 30 seconds")
          setError("Request timed out. Please try again.")
          setLoading(false)
        }
      }, 30000)

      fetchRealSubjectData().finally(() => {
        clearTimeout(timeoutId)
      })

      return () => clearTimeout(timeoutId)
    } else {
      console.warn("No testId provided to SubjectTopicIntelligence")
      setError("Test ID is required")
      setLoading(false)
    }
  }, [testId, filters])

  const fetchRealSubjectData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("=== Fetching Subject Intelligence Data ===")
      console.log("Test ID:", testId)

      if (!testId) {
        throw new Error("Test ID is required")
      }

      const url = `/api/admin/analytics/test/${testId}/subject-intelligence`
      console.log("Fetching from URL:", url)

      const headers = getAuthHeaders()
      console.log("Request headers:", Object.keys(headers))

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.")
      }

      if (response.status === 403) {
        throw new Error("Access denied. Admin privileges required.")
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)
        throw new Error(`Failed to fetch subject data: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("=== Received Subject Intelligence Data ===")
      console.log("Data structure:", {
        success: data.success,
        hasSubjectPerformance: !!data.subjectPerformance,
        subjectPerformanceLength: data.subjectPerformance?.length || 0,
        hasCompetencyRadar: !!data.competencyRadar,
        competencyRadarLength: data.competencyRadar?.length || 0,
        totalAttempts: data.totalAttempts,
      })

      if (!data.success) {
        throw new Error(data.error || "API returned unsuccessful response")
      }

      setSubjectData(data)
      setError(null)
    } catch (error) {
      console.error("=== Subject Intelligence Fetch Error ===")
      console.error("Error:", error)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
      setError(error.message)
      setSubjectData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
            Subject & Topic Intelligence
          </h2>
        </div>
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">Error loading subject data: {error}</p>
          {error.includes("Authentication") && (
            <p className="text-yellow-400 text-sm mt-2">Please refresh the page and log in again.</p>
          )}
          <button
            onClick={fetchRealSubjectData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!subjectData) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
          Subject & Topic Intelligence
        </h2>
        <div className="text-slate-400">No subject data available for this test.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
            Subject & Topic Intelligence
          </h2>
          <div className="group relative">
            <Info className="h-5 w-5 text-slate-400 cursor-help" />
            <div className="absolute left-0 top-6 w-80 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <p className="text-sm text-slate-300">
                <strong>Subject Intelligence Analysis:</strong>
                <br />• <strong>Average Score:</strong> Mean marks obtained across all attempts
                <br />• <strong>Questions:</strong> Total questions per subject in this test
                <br />• <strong>Accuracy:</strong> Percentage of correct answers per subject
                <br />• <strong>Performance Status:</strong> Based on average score thresholds
                <br />
                Data is calculated from actual student test attempts.
              </p>
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-400">Learning Analytics</div>
      </div>

      {/* Subject Performance Overview Cards */}
      {subjectData.subjectPerformance && subjectData.subjectPerformance.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjectData.subjectPerformance.map((subject, index) => {
            const performanceStatus =
              subject.averageScore >= 70 ? "Good" : subject.averageScore >= 50 ? "Average" : "Needs Work"
            const statusColor =
              subject.averageScore >= 70
                ? "text-green-400"
                : subject.averageScore >= 50
                  ? "text-yellow-400"
                  : "text-red-400"

            return (
              <Card key={subject.subject} className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mt-6 mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-teal-400" />
                      <h3 className="font-semibold text-slate-200">{subject.subject}</h3>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${statusColor}`}>
                      {subject.averageScore >= 50 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {performanceStatus}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between ">
                      <span className="text-slate-400 text-sm">Average Score</span>
                      <span className="text-slate-200 font-medium">{subject.averageScore.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Questions</span>
                      <span className="text-slate-200">{subject.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Accuracy</span>
                      <span className="text-slate-200">{subject.accuracy.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Subject Performance Comparison Chart */}
      {subjectData.subjectPerformance && subjectData.subjectPerformance.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200">Subject Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData.subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="subject" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value, name) => [
                    `${Number.parseFloat(value).toFixed(2)}%`,
                    name === "averageScore" ? "Average Score %" : name,
                  ]}
                />
                <Bar dataKey="averageScore" fill="#14b8a6" name="Average Score %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Competency Radar Chart */}
      {/* {subjectData.competencyRadar && subjectData.competencyRadar.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Competency Analysis
              <div className="group relative">
                <Info className="h-4 w-4 text-slate-400 cursor-help" />
                <div className="absolute left-0 top-6 w-80 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <p className="text-sm text-slate-300">
                    <strong>Competency Analysis:</strong>
                    <br />• <strong>Conceptual:</strong> Understanding of fundamental concepts
                    <br />• <strong>Application:</strong> Ability to apply knowledge practically
                    <br />• <strong>Problem Solving:</strong> Complex analytical thinking
                    <br />• <strong>Speed:</strong> Efficiency in answering questions
                    <br />
                    Scores are calculated from actual test attempts.
                  </p>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={subjectData.competencyRadar}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af" }} />
                <PolarRadiusAxis tick={{ fill: "#9ca3af" }} />
                <Radar name="Conceptual" dataKey="conceptual" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Radar name="Application" dataKey="application" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                <Radar
                  name="Problem Solving"
                  dataKey="problem_solving"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.1}
                />
                <Radar name="Speed" dataKey="speed" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                <Tooltip formatter={(value, name) => [Number.parseFloat(value).toFixed(2), name]} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )} */}

      {/* Learning Gaps */}
      {/* {subjectData.learningGaps && subjectData.learningGaps.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Target className="h-5 w-5 text-red-400" />
              Critical Learning Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectData.learningGaps.map((gap, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${gap.severity === "High" ? "bg-red-400" : "bg-yellow-400"}`}
                    ></div>
                    <div>
                      <p className="text-slate-200 font-medium">{gap.area}</p>
                      <p className="text-slate-400 text-sm">{gap.affectedStudents}% of students affected</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">{gap.avgScore.toFixed(1)}%</p>
                    <p className="text-slate-400 text-sm">avg score</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}
    </div>
  )
}
