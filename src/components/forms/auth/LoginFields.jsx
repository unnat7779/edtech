"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Mail, Lock, Shield, UserX, KeyRound, Wifi, ArrowRight, UserPlus } from "lucide-react"

export default function LoginFields({ onSubmit, loading, errors, errorType }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const fillAdminCredentials = () => {
    setFormData({
      email: "admin@edtech.com",
      password: "admin123",
    })
  }

  const getErrorIcon = () => {
    switch (errorType) {
      case "user_not_found":
        return <UserX className="w-6 h-6 text-orange-400 animate-pulse" />
      case "wrong_password":
        return <KeyRound className="w-6 h-6 text-red-400 animate-pulse" />
      default:
        return <Wifi className="w-6 h-6 text-yellow-400 animate-pulse" />
    }
  }

  const getErrorGradient = () => {
    switch (errorType) {
      case "user_not_found":
        return "from-orange-900/40 to-yellow-900/40 border-orange-400/50"
      case "wrong_password":
        return "from-red-900/40 to-pink-900/40 border-red-400/50"
      default:
        return "from-yellow-900/40 to-orange-900/40 border-yellow-400/50"
    }
  }

  return (
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
          error={errors.email}
          placeholder="Enter your email"
          icon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
          icon={<Lock className="w-4 h-4" />}
        />
      </div>

      {/* Enhanced Error Message - Only show when there's an error */}
      {errors.submit && errors.errorInfo && (
        <div className="animate-slideInDown">
          <div className={`p-6 bg-gradient-to-br ${getErrorGradient()} rounded-xl backdrop-blur-sm border-2 shadow-xl`}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">{getErrorIcon()}</div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center space-x-2">
                  <h4 className="text-white font-bold text-xl animate-fadeIn">{errors.errorInfo.title}</h4>
                  <ArrowRight className="w-5 h-5 text-white animate-bounce" />
                </div>

                <p className="text-slate-100 text-lg animate-fadeIn animation-delay-200 leading-relaxed">
                  {errors.errorInfo.message}
                </p>

                <div className="p-4 bg-black/30 rounded-lg animate-fadeIn animation-delay-400">
                  <p className="text-slate-200 flex items-start text-sm">
                    <span className="text-lg mr-2">💡</span>
                    <span>{errors.errorInfo.tip}</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 animate-fadeIn animation-delay-600">
                  {errorType === "user_not_found" && (
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

                  {errorType === "wrong_password" && (
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

        <Button
          type="button"
          onClick={fillAdminCredentials}
          variant="outline"
          className="w-full py-3 border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-200 hover:scale-105"
        >
          <Shield className="w-4 h-4 mr-2" />
          Fill Admin Credentials
        </Button>
      </div>
    </form>
  )
}
