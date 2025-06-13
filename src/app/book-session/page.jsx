"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DoubtSessionForm from "@/components/forms/DoubtSessionForm"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { useAuth } from "@/hooks/auth/useAuth"

export default function BookSessionPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      setPageLoading(false)
    }
  }, [loading])

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Book a Doubt Session
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Get personalized help from expert teachers. Clear your doubts and boost your understanding.
          </p>
        </div>

        {/* User Info Banner */}
        {isAuthenticated && user && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">Welcome, {user.name}!</h3>
                <p className="text-slate-400">
                  Class {user.class} • We'll use your registered details for this session
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Session Details</h2>
            <p className="text-teal-100 mt-2">Fill in the details below to book your doubt session</p>
          </div>

          <div className="p-8">
            <DoubtSessionForm user={user} isAuthenticated={isAuthenticated} />
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Expert Teachers</h3>
            <p className="text-slate-400">Get help from experienced and qualified teachers</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Flexible Timing</h3>
            <p className="text-slate-400">Choose your preferred date and time slot</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Multiple Modes</h3>
            <p className="text-slate-400">WhatsApp, Zoom, or Google Meet - your choice</p>
          </div>
        </div>
      </div>
    </div>
  )
}
