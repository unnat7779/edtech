"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import { clearAuthData } from "@/lib/auth-utils"
import { LogOut } from "lucide-react"

export default function ProfileForm() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    class: "",
    isEnrolledInCoaching: false,
    coachingName: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        console.log("🔍 Fetching user data for profile form...")

        // Fetch fresh user data from API
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          const userData = result.user
          console.log("📊 Raw API response:", result)
          console.log("👤 User data received:", userData)
          setUser(userData)

          // Pre-fill form with existing user data - handle all possible field name variations
          const mappedFormData = {
            name: userData.name || "",
            email: userData.email || "",
            // Map phone/whatsappNo/whatsapp to whatsapp field
            whatsapp: userData.phone || userData.whatsappNo || userData.whatsapp || "",
            // Map grade/class/studentClass to class field
            class: userData.grade || userData.class || userData.studentClass || "",
            // Map enrolledInCoaching/isEnrolledInCoaching to isEnrolledInCoaching
            isEnrolledInCoaching: userData.enrolledInCoaching || userData.isEnrolledInCoaching || false,
            // Map coachingName/coachingInstitute to coachingName
            coachingName: userData.coachingName || userData.coachingInstitute || "",
            // Map dob/dateOfBirth to dob
            dob: userData.dob || userData.dateOfBirth || "",
            // Direct field mappings
            address: userData.address || "",
            city: userData.city || "",
            state: userData.state || "",
            pincode: userData.pincode || userData.zipCode || "",
          }

          console.log("🎯 Mapped form data:", mappedFormData)
          setFormData(mappedFormData)
        } else {
          console.error("❌ Failed to fetch user data:", response.status, response.statusText)
          const errorData = await response.text()
          console.error("❌ Error response:", errorData)
          router.push("/login")
        }
      } catch (error) {
        console.error("❌ Error fetching user data:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setErrorMessage("Session expired. Please login again.")
        router.push("/login")
        return
      }

      const updateData = {
        ...formData,
        whatsappNo: formData.whatsapp, // Map whatsapp to whatsappNo for backend compatibility
        phone: formData.whatsapp, // Also map to phone field
        grade: formData.class, // Map class to grade for backend compatibility
        enrolledInCoaching: formData.isEnrolledInCoaching, // Map to backend field name
      }

      console.log("📤 Submitting profile update:", updateData)

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Profile update response:", result)

        // Update localStorage with new user data while preserving the token
        const currentToken = localStorage.getItem("token")
        if (currentToken && result.user) {
          // Update user data in localStorage without affecting the token
          localStorage.setItem("user", JSON.stringify(result.user))
          setUser(result.user)

          console.log("✅ Updated localStorage with new user data")
          console.log("🔑 Token preserved:", currentToken ? "Yes" : "No")
        }

        setSuccessMessage("Profile updated successfully!")

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("")
        }, 3000)
      } else {
        const error = await response.json()
        console.error("❌ Profile update failed:", error)

        if (response.status === 401) {
          setErrorMessage("Session expired. Please login again.")
          clearAuthData()
          router.push("/login")
        } else {
          setErrorMessage(error.message || "Failed to update profile")
        }
      }
    } catch (error) {
      console.error("❌ Profile update error:", error)
      setErrorMessage("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setErrorMessage("Session expired. Please login again.")
        router.push("/login")
        return
      }

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Avatar upload response:", result)

        // Update user in local storage with new avatar URL while preserving token
        const currentToken = localStorage.getItem("token")
        const updatedUser = {
          ...user,
          profile: { ...user.profile, avatar: result.avatarUrl },
        }

        if (currentToken) {
          localStorage.setItem("user", JSON.stringify(updatedUser))
          setUser(updatedUser)
          console.log("✅ Avatar updated in localStorage, token preserved")
        }

        setSuccessMessage("Avatar updated successfully!")

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("")
        }, 3000)
      } else {
        const error = await response.json()
        console.error("❌ Avatar upload failed:", error)

        if (response.status === 401) {
          setErrorMessage("Session expired. Please login again.")
          clearAuthData()
          router.push("/login")
        } else {
          setErrorMessage(error.message || "Failed to update avatar")
        }
      }
    } catch (error) {
      console.error("❌ Avatar upload error:", error)
      setErrorMessage("An error occurred while uploading avatar")
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      clearAuthData()
      router.push("/")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 overflow-hidden">
      {/* Header with logout button */}
      <div className="bg-gradient-to-r from-teal-900/50 to-blue-900/50 p-4 sm:p-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Update Profile</h2>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-teal-400 hover:border-teal-500 transition-all duration-300 group"
        >
          <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
          Logout
        </Button>
      </div>

      {/* Avatar section */}
      <div className="flex flex-col items-center justify-center p-6 border-b border-slate-700">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center overflow-hidden">
            {user?.profile?.avatar ? (
              <img
                src={user.profile.avatar || "/placeholder.svg"}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
              </span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-slate-800 rounded-full p-1 border-2 border-slate-700">
            <label
              htmlFor="avatar-upload"
              className="w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-400 flex items-center justify-center cursor-pointer transition-colors duration-300"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
        </div>
        <p className="text-sm text-slate-400">Click the + button to change your profile picture</p>
      </div>

      {/* Success/Error messages */}
      {successMessage && (
        <div className="m-6 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-center">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="m-6 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-center">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium text-teal-400 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-200 opacity-60"
                  disabled
                  title="Email cannot be changed"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-300 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-200"
                />
              </div>
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-slate-300 mb-1">
                  Class
                </label>
                <select
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-200"
                >
                  <option value="">Select Class</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                  <option value="13">Dropper (13th)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isEnrolledInCoaching"
                  checked={formData.isEnrolledInCoaching}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500 bg-slate-700"
                />
                <span className="ml-2 text-sm text-slate-300">Are you enrolled in any coaching?</span>
              </label>
            </div>
            {formData.isEnrolledInCoaching && (
              <div>
                <label htmlFor="coachingName" className="block text-sm font-medium text-slate-300 mb-1">
                  Coaching Institute Name
                </label>
                <input
                  type="text"
                  id="coachingName"
                  name="coachingName"
                  value={formData.coachingName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-200"
                  placeholder="Enter coaching institute name"
                />
              </div>
            )}
          </div>

          {/* Additional Information */}
          {/* <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium text-blue-400 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-slate-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-200"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-200"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-slate-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-200"
                />
              </div>
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-slate-300 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-200"
                />
              </div>
            </div>
          </div> */}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="px-8 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
