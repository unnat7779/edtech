"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import RegisterFields from "./auth/RegisterFields"
import { useAuth } from "@/hooks/auth/useAuth"
import ConfettiAnimation from "@/components/ui/ConfettiAnimation"

export default function RegisterForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const validateForm = (formData) => {
    const newErrors = {}

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long"
    }

    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.whatsappNo || formData.whatsappNo.trim().length < 10) {
      newErrors.whatsappNo = "Please enter a valid WhatsApp number"
    }

    if (!formData.class) {
      newErrors.class = "Please select your class"
    }

    return newErrors
  }

  const handleSubmit = async (formData) => {
    console.log("Form submitted with data:", formData)
    setErrors({})

    // Client-side validation
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("Registration response:", data)

      if (data.success && data.token) {
        setShowConfetti(true)

        // Wait for confetti animation before redirecting
        setTimeout(() => {
          login(data.user, data.token)
          router.push("/dashboard")
        }, 3000)
      } else {
        // Handle validation errors from server
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ submit: data.error || "Registration failed" })
        }
      }
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ submit: "Registration failed. Please check your connection and try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showConfetti && <ConfettiAnimation />}

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Account Details</h2>
          <p className="text-blue-100">Fill in your information to get started</p>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <RegisterFields onSubmit={handleSubmit} loading={loading} errors={errors} />
        </div>
      </div>
    </>
  )
}
