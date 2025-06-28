"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth/useAuth"
import { Mail, Lock, Shield, UserX, KeyRound, AlertTriangle, UserPlus, ArrowRight } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

export default function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isWobbling, setIsWobbling] = useState(false)
  const formRef = useRef(null)

  const triggerWobble = () => {
    setIsWobbling(true)
    setTimeout(() => setIsWobbling(false), 600)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const fillAdminCredentials = () => {
    setFormData({
      email: "admin@edtech.com",
      password: "admin123",
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!formData.email || !formData.password) {
      setError({
        type: "validation",
        title: "Missing Information ⚠️",
        message: "Please enter both email and password to continue.",
        tip: "All fields are required for login.",
      })
      triggerWobble()
      return
    }

    if (!formData.email.includes("@")) {
      setError({
        type: "validation",
        title: "Invalid Email Format 📧",
        message: "Please enter a valid email address.",
        tip: "Email should contain @ symbol (e.g., user@example.com)",
      })
      triggerWobble()
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Success - redirect user
        login(data.user, data.token)
        if (data.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
        return
      }

      // Handle different error cases
      let errorInfo
      if (response.status === 401) {
        if (data.error && data.error.includes("User not found")) {
          errorInfo = {
            type: "user_not_found",
            title: "Account Not Found 🔍",
            message: `No account exists with email "${formData.email}". Please check your email or create a new account.`,
            tip: "Make sure you've registered with this email address first!",
          }
        } else {
          errorInfo = {
            type: "wrong_password",
            title: "Invalid Credentials 🔐",
            message: "PLease enter the correct credentials to access your account.",
            tip: "Password is case-sensitive. Check your caps lock!",
          }
        }
      } else {
        errorInfo = {
          type: "generic",
          title: "Login Failed ⚠️",
          message: "Something went wrong. Please check your credentials and try again.",
          tip: "If the problem persists, please contact support.",
        }
      }

      setError(errorInfo)
      triggerWobble()
    } catch (networkError) {
      console.error("Network error:", networkError)
      setError({
        type: "network",
        title: "Connection Problem 🌐",
        message: "Unable to connect to the server. Please check your internet connection.",
        tip: "Try refreshing the page or check your network connection.",
      })
      triggerWobble()
    } finally {
      setLoading(false)
    }
  }

  const getErrorIcon = () => {
    switch (error?.type) {
      case "user_not_found":
        return <UserX className="w-6 h-6 text-orange-400 animate-pulse" />
      case "wrong_password":
        return <KeyRound className="w-6 h-6 text-red-400 animate-pulse" />
      case "validation":
        return <AlertTriangle className="w-6 h-6 text-yellow-400 animate-pulse" />
      default:
        return <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
    }
  }

  const getErrorGradient = () => {
    switch (error?.type) {
      case "user_not_found":
        return "from-orange-900/40 to-yellow-900/40 border-orange-400/50"
      case "wrong_password":
        return "from-red-900/40 to-pink-900/40 border-red-400/50"
      case "validation":
        return "from-yellow-900/40 to-orange-900/40 border-yellow-400/50"
      default:
        return "from-red-900/40 to-orange-900/40 border-red-400/50"
    }
  }

  return (
    <div
      ref={formRef}
      className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden transition-all duration-300 ${
        isWobbling ? "animate-wobble" : ""
      }`}
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
        <p className="text-green-100">Enter your credentials to access your account</p>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Login Fields Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Login Credentials</h3>
            </div>

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={<Lock className="w-4 h-4" />}
            />
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="animate-slideInDown">
              <div
                className={`p-6 bg-gradient-to-br ${getErrorGradient()} rounded-xl backdrop-blur-sm border-2 shadow-xl`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">{getErrorIcon()}</div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-bold text-xl animate-fadeIn">{error.title}</h4>
                      <ArrowRight className="w-5 h-5 text-white animate-bounce" />
                    </div>

                    <p className="text-slate-100 text-lg animate-fadeIn animation-delay-200 leading-relaxed">
                      {error.message}
                    </p>

                    <div className="p-4 bg-black/30 rounded-lg animate-fadeIn animation-delay-400">
                      <p className="text-slate-200 flex items-start text-sm">
                        <span className="text-lg mr-2">💡</span>
                        <span>{error.tip}</span>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 animate-fadeIn animation-delay-600">
                      {error.type === "user_not_found" && (
                        <>
                          <button
                            type="button"
                            onClick={() => (window.location.href = "/register")}
                            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Create Account
                          </button>
                          <button
                            type="button"
                            onClick={fillAdminCredentials}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Try Admin Login
                          </button>
                        </>
                      )}

                      {error.type === "wrong_password" && (
                        <button
                          type="button"
                          onClick={fillAdminCredentials}
                          className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Try Admin Credentials
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button type="submit" className="w-full py-3 text-lg font-semibold" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* <Button
              type="button"
              onClick={fillAdminCredentials}
              variant="outline"
              className="w-full py-3 border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-200 hover:scale-105"
            >
              <Shield className="w-4 h-4 mr-2" />
              Fill Admin Credentials
            </Button> */}
          </div>
        </form>
      </div>
    </div>
  )
}
