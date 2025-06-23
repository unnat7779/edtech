"use client"

import { useState, useEffect } from "react"
import { Phone, Mail, MessageCircle, X, HelpCircle, Send, History, Calendar } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } catch (error) {
        console.error("Error parsing user data:", error)
        setIsLoggedIn(false)
      }
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  // Enhanced hiding logic for test pages and test-related activities
  const shouldHideButton = () => {
    if (!pathname) return false

    // Hide during active test attempts
    if (
      pathname.includes("/test/") ||
      pathname.includes("/test-results/") ||
      pathname.startsWith("/test/") ||
      pathname.startsWith("/test-results/") ||
      pathname.includes("/analytics/student/") ||
      pathname.match(/^\/test\/\d+/) ||
      pathname.match(/^\/test-results\/\d+/) ||
      pathname === "/tests" // Hide on test selection page too
    ) {
      return true
    }

    return false
  }

  // Don't render the button if it should be hidden
  if (shouldHideButton()) {
    return null
  }

  const handleContactClick = () => {
    setShowContactModal(true)
    setIsOpen(false)
  }

  const handleSubmitFeedbackClick = () => {
    router.push("/feedback")
    setIsOpen(false)
  }

  const handleFeedbackHistoryClick = () => {
    router.push("/feedback-history")
    setIsOpen(false)
  }

  const handleSessionHistoryClick = () => {
    router.push("/student/sessions")
    setIsOpen(false)
  }

  const contactInfo = {
    email: "jeeelevate@gmail.com",
    phone: "+91 6388153401",
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Action Buttons - Show when expanded */}
          {isOpen && (
            <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
              {/* Contact Us - Always visible */}
              <button
                onClick={handleContactClick}
                className="flex items-center gap-3 bg-slate-800/90 backdrop-blur-md text-white px-4 py-3 rounded-full shadow-lg hover:bg-slate-700/90 transition-all duration-300 transform hover:scale-105 border border-slate-600/50"
                title="Contact Us"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="text-sm font-medium whitespace-nowrap">Contact Us</span>
              </button>

              {/* Feedback History - Show for logged-in users */}
              {isLoggedIn && (
                <button
                  onClick={handleFeedbackHistoryClick}
                  className="flex items-center gap-3 bg-teal-600/90 backdrop-blur-md text-white px-4 py-3 rounded-full shadow-lg hover:bg-teal-500/90 transition-all duration-300 transform hover:scale-105 border border-teal-500/50"
                  title="Feedback History"
                >
                  <History className="h-5 w-5" />
                  <span className="text-sm font-medium whitespace-nowrap">Feedback History</span>
                </button>
              )}

              {/* Session History - Show for logged-in users */}
              {isLoggedIn && (
                <button
                  onClick={handleSessionHistoryClick}
                  className="flex items-center gap-3 bg-blue-600/90 backdrop-blur-md text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-500/90 transition-all duration-300 transform hover:scale-105 border border-blue-500/50"
                  title="Session History"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm font-medium whitespace-nowrap">Session History</span>
                </button>
              )}

              {/* Submit Feedback - Show for logged-in users */}
              {isLoggedIn && (
                <button
                  onClick={handleSubmitFeedbackClick}
                  className="flex items-center gap-3 bg-emerald-600/90 backdrop-blur-md text-white px-4 py-3 rounded-full shadow-lg hover:bg-emerald-500/90 transition-all duration-300 transform hover:scale-105 border border-emerald-500/50"
                  title="Submit Feedback"
                >
                  <Send className="h-5 w-5" />
                  <span className="text-sm font-medium whitespace-nowrap">Submit Feedback</span>
                </button>
              )}
            </div>
          )}

          {/* Main FAB Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center ${
              isOpen ? "rotate-45" : "rotate-0"
            }`}
          >
            {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-slate-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-200">Contact Us</h3>
                  <p className="text-sm text-slate-400">Get in touch with our team</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Email */}
              <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl border border-slate-600/50">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Email Address</p>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-slate-200 font-medium hover:text-blue-400 transition-colors"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl border border-slate-600/50">
                <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-teal-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Phone Number</p>
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="text-slate-200 font-medium hover:text-teal-400 transition-colors"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              {/* Feedback Options for Logged-in Users */}
              {isLoggedIn && (
                <div className="border-t border-slate-700 pt-6">
                  <p className="text-sm text-slate-400 mb-4">Need to share feedback?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setShowContactModal(false)
                        handleSubmitFeedbackClick()
                      }}
                      className="flex flex-col items-center gap-2 p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                    >
                      <Send className="h-5 w-5 text-emerald-400" />
                      <span className="text-xs text-emerald-300 font-medium">Submit</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowContactModal(false)
                        handleFeedbackHistoryClick()
                      }}
                      className="flex flex-col items-center gap-2 p-3 bg-teal-500/20 rounded-xl border border-teal-500/30 hover:bg-teal-500/30 transition-colors"
                    >
                      <History className="h-5 w-5 text-teal-400" />
                      <span className="text-xs text-teal-300 font-medium">History</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Support Hours */}
              <div className="text-center p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                <p className="text-sm text-slate-400">
                  <span className="font-medium text-slate-300">Support Hours:</span> Mon-Fri 9:00 AM - 6:00 PM IST
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-700">
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
