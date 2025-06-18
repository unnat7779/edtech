"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/Card"
import { User, Shield, CheckCircle, AlertCircle, RefreshCw, Copy, ExternalLink } from "lucide-react"
import Button from "@/components/ui/Button"

function ImpersonatedLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("loading") // loading, success, error
  const [message, setMessage] = useState("Initializing impersonated login...")
  const [userInfo, setUserInfo] = useState(null)
  const [debugInfo, setDebugInfo] = useState({})
  const [tokenSource, setTokenSource] = useState("")

  useEffect(() => {
    const performImpersonatedLogin = async () => {
      try {
        console.log("🚀 Starting impersonated login process...")
        setMessage("Searching for impersonation token...")

        // Collect comprehensive debug information
        const debug = {
          urlToken: searchParams.get("token"),
          urlUserId: searchParams.get("userId"),
          urlUserName: searchParams.get("userName"),
          urlTimestamp: searchParams.get("timestamp"),
          urlSource: searchParams.get("source"),
          sessionStorage: null,
          localStorage: null,
          currentUrl: typeof window !== "undefined" ? window.location.href : "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          timestamp: new Date().toISOString(),
        }

        // Check sessionStorage for pending impersonation
        try {
          if (typeof window !== "undefined") {
            const pendingData = sessionStorage.getItem("pendingImpersonation")
            const impersonationData = sessionStorage.getItem("impersonationData")
            debug.sessionStorage = {
              pendingImpersonation: pendingData ? "Present" : "Empty",
              impersonationData: impersonationData ? "Present" : "Empty",
            }
            console.log("📦 SessionStorage check:", debug.sessionStorage)
          }
        } catch (e) {
          debug.sessionStorage = "Error: " + e.message
          console.error("❌ SessionStorage error:", e)
        }

        // Check localStorage for backup tokens
        try {
          if (typeof window !== "undefined") {
            const tempToken = localStorage.getItem("tempImpersonationToken")
            const tempUser = localStorage.getItem("tempImpersonationUser")
            debug.localStorage = {
              tempToken: tempToken ? "Present" : "Empty",
              tempUser: tempUser ? "Present" : "Empty",
            }
            console.log("💾 LocalStorage check:", debug.localStorage)
          }
        } catch (e) {
          debug.localStorage = "Error: " + e.message
          console.error("❌ LocalStorage error:", e)
        }

        setDebugInfo(debug)
        console.log("🔍 Debug info collected:", debug)

        // Try to get token from multiple sources in priority order
        let impersonationToken = null
        let impersonationUser = null
        let source = null

        // Priority 1: URL parameters (most reliable for new tabs)
        if (debug.urlToken) {
          impersonationToken = debug.urlToken
          source = "URL Parameter"
          if (debug.urlUserName) {
            impersonationUser = { name: decodeURIComponent(debug.urlUserName) }
          }
          console.log("✅ Token found in URL parameters")
        }

        // Priority 2: SessionStorage pending impersonation
        if (!impersonationToken && typeof window !== "undefined") {
          try {
            const pendingData = sessionStorage.getItem("pendingImpersonation")
            if (pendingData) {
              const parsed = JSON.parse(pendingData)
              if (parsed.token && parsed.user) {
                impersonationToken = parsed.token
                impersonationUser = parsed.user
                source = "SessionStorage (Pending)"
                sessionStorage.removeItem("pendingImpersonation") // Clean up
                console.log("✅ Token found in sessionStorage (pending)")
              }
            }
          } catch (e) {
            console.error("❌ Error parsing pending impersonation data:", e)
          }
        }

        // Priority 3: SessionStorage regular impersonation data
        if (!impersonationToken && typeof window !== "undefined") {
          try {
            const sessionData = sessionStorage.getItem("impersonationData")
            if (sessionData) {
              const parsed = JSON.parse(sessionData)
              if (parsed.token) {
                impersonationToken = parsed.token
                impersonationUser = parsed.user
                source = "SessionStorage (Regular)"
                sessionStorage.removeItem("impersonationData") // Clean up
                console.log("✅ Token found in sessionStorage (regular)")
              }
            }
          } catch (e) {
            console.error("❌ Error parsing sessionStorage impersonation data:", e)
          }
        }

        // Priority 4: LocalStorage backup
        if (!impersonationToken && typeof window !== "undefined") {
          try {
            const tempToken = localStorage.getItem("tempImpersonationToken")
            const tempUser = localStorage.getItem("tempImpersonationUser")
            if (tempToken) {
              impersonationToken = tempToken
              source = "LocalStorage (Backup)"
              if (tempUser) {
                impersonationUser = JSON.parse(tempUser)
              }
              // Clean up
              localStorage.removeItem("tempImpersonationToken")
              localStorage.removeItem("tempImpersonationUser")
              console.log("✅ Token found in localStorage backup")
            }
          } catch (e) {
            console.error("❌ Error accessing localStorage backup:", e)
          }
        }

        if (!impersonationToken) {
          console.error("❌ No impersonation token found in any source")
          console.log("🔍 Sources checked:", {
            urlParams: !!debug.urlToken,
            sessionPending: typeof window !== "undefined" ? !!sessionStorage.getItem("pendingImpersonation") : false,
            sessionRegular: typeof window !== "undefined" ? !!sessionStorage.getItem("impersonationData") : false,
            localBackup: typeof window !== "undefined" ? !!localStorage.getItem("tempImpersonationToken") : false,
          })
          throw new Error("No impersonation token found")
        }

        setTokenSource(source)
        console.log(`🎯 Token found from: ${source}`)
        setMessage(`Token found from ${source}. Validating...`)

        // Validate the impersonation token
        console.log("🔐 Validating impersonation token...")
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${impersonationToken}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("❌ Token validation failed:", errorData)
          throw new Error(errorData.error || "Invalid impersonation token")
        }

        const userData = await response.json()
        console.log("✅ Token validated successfully:", userData)

        // Set up the impersonated user session
        if (typeof window !== "undefined") {
          localStorage.setItem("token", impersonationToken)
          localStorage.setItem("user", JSON.stringify(userData.user))

          // Mark this as an impersonated session with metadata
          localStorage.setItem("isImpersonatedSession", "true")
          localStorage.setItem("impersonationStartTime", new Date().toISOString())
          localStorage.setItem("impersonationSource", source)
          if (debug.urlUserId) {
            localStorage.setItem("impersonatedUserId", debug.urlUserId)
          }
        }

        setUserInfo(userData.user)
        setStatus("success")
        setMessage(`Successfully logged in as ${userData.user.name}`)

        // Clean up any remaining temporary data
        try {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("pendingImpersonation")
            sessionStorage.removeItem("impersonationData")
            localStorage.removeItem("tempImpersonationToken")
            localStorage.removeItem("tempImpersonationUser")
          }
        } catch (e) {
          console.warn("⚠️ Error cleaning up temporary data:", e)
        }

        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          console.log("🚀 Redirecting to dashboard...")
          router.push("/dashboard")
        }, 2000)
      } catch (error) {
        console.error("❌ Impersonated login error:", error)
        setStatus("error")
        setMessage(error.message || "Failed to log in")

        // Clean up any stored tokens on error
        try {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("pendingImpersonation")
            sessionStorage.removeItem("impersonationData")
            localStorage.removeItem("tempImpersonationToken")
            localStorage.removeItem("tempImpersonationUser")
          }
        } catch (e) {
          console.error("❌ Error cleaning up tokens:", e)
        }

        // Redirect to login page after error
        setTimeout(() => {
          console.log("🔄 Redirecting to login page...")
          router.push("/login")
        }, 5000)
      }
    }

    // Add a small delay to ensure the page is fully loaded and storage is accessible
    const timer = setTimeout(performImpersonatedLogin, 300)
    return () => clearTimeout(timer)
  }, [router, searchParams])

  const copyDebugInfo = () => {
    if (typeof navigator !== "undefined") {
      const debugText = JSON.stringify(debugInfo, null, 2)
      navigator.clipboard.writeText(debugText)
      alert("Debug info copied to clipboard")
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <RefreshCw className="h-8 w-8 text-teal-400 animate-spin" />
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-400" />
      case "error":
        return <AlertCircle className="h-8 w-8 text-red-400" />
      default:
        return <User className="h-8 w-8 text-slate-400" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "loading":
        return "from-teal-900/50 to-blue-900/50 border-teal-700/50"
      case "success":
        return "from-green-900/50 to-teal-900/50 border-green-700/50"
      case "error":
        return "from-red-900/50 to-orange-900/50 border-red-700/50"
      default:
        return "from-slate-800/60 to-slate-900/60 border-slate-700/50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className={`bg-gradient-to-br ${getStatusColor()} backdrop-blur-xl border max-w-lg w-full`}>
        <CardContent className="p-8 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">{getStatusIcon()}</div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-200 mb-2">
            {status === "loading" && "Impersonated Login"}
            {status === "success" && "Login Successful"}
            {status === "error" && "Login Failed"}
          </h1>

          {/* Message */}
          <p className="text-slate-400 mb-6">{message}</p>

          {/* Token Source Info */}
          {tokenSource && (
            <div className="bg-slate-800/30 rounded-lg p-3 mb-4">
              <p className="text-slate-300 text-sm">
                <span className="text-slate-400">Token Source:</span> {tokenSource}
              </p>
            </div>
          )}

          {/* User Info (when successful) */}
          {status === "success" && userInfo && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{userInfo.name?.charAt(0).toUpperCase() || "U"}</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-200 font-medium">{userInfo.name}</p>
                  <p className="text-slate-400 text-sm">{userInfo.email}</p>
                </div>
              </div>
              {userInfo.class && <p className="text-slate-500 text-sm">Class {userInfo.class}</p>}
            </div>
          )}

          {/* Admin Impersonation Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-4">
            <Shield className="h-3 w-3" />
            <span>Admin Impersonated Session</span>
          </div>

          {/* Progress Indicator */}
          {status === "loading" && (
            <div className="mb-6">
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-teal-400 to-blue-400 h-1 rounded-full animate-pulse"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </div>
          )}

          {/* Auto-redirect notice */}
          {status === "success" && (
            <p className="text-xs text-slate-500 mb-4">Redirecting to dashboard in 2 seconds...</p>
          )}

          {status === "error" && (
            <p className="text-xs text-slate-500 mb-4">Redirecting to login page in 5 seconds...</p>
          )}

          {/* Debug info for development or errors */}
          {(process.env.NODE_ENV === "development" || status === "error") && (
            <div className="mt-4 p-3 bg-slate-800/30 rounded text-xs text-left">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 font-medium">Debug Info:</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyDebugInfo}
                  className="text-slate-500 hover:text-slate-300 p-1"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1 text-slate-500">
                <p>• URL Token: {debugInfo.urlToken ? "✅ Present" : "❌ Empty"}</p>
                <p>• URL User ID: {debugInfo.urlUserId || "Not provided"}</p>
                <p>• URL Source: {debugInfo.urlSource || "Not provided"}</p>
                <p>
                  • SessionStorage:{" "}
                  {typeof debugInfo.sessionStorage === "object"
                    ? `Pending: ${debugInfo.sessionStorage?.pendingImpersonation}, Regular: ${debugInfo.sessionStorage?.impersonationData}`
                    : debugInfo.sessionStorage || "Not checked"}
                </p>
                <p>
                  • LocalStorage:{" "}
                  {typeof debugInfo.localStorage === "object"
                    ? `Token: ${debugInfo.localStorage?.tempToken}, User: ${debugInfo.localStorage?.tempUser}`
                    : debugInfo.localStorage || "Not checked"}
                </p>
                <p>• Timestamp: {debugInfo.urlTimestamp || "Not provided"}</p>
              </div>
              {debugInfo.currentUrl && (
                <p className="text-slate-600 text-xs mt-2 break-all">URL: {debugInfo.currentUrl}</p>
              )}
            </div>
          )}

          {/* Manual retry button for errors */}
          {status === "error" && (
            <div className="mt-4 space-y-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Login
              </Button>
              <Button
                onClick={() => router.push("/login")}
                variant="ghost"
                className="text-slate-400 hover:text-slate-200"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/50 max-w-lg w-full">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <RefreshCw className="h-8 w-8 text-teal-400 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-slate-200 mb-2">Loading...</h1>
          <p className="text-slate-400 mb-6">Preparing impersonated login...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ImpersonatedLoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ImpersonatedLoginContent />
    </Suspense>
  )
}
