"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, X, History, Send } from "lucide-react"
import Button from "@/components/ui/Button"

export default function FloatingFeedbackButton() {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()

  const handleFeedbackClick = () => {
    router.push("/feedback")
  }

  const handleHistoryClick = () => {
    router.push("/feedback-history")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 mb-2 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
          <Button
            onClick={handleHistoryClick}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white shadow-lg whitespace-nowrap"
            size="sm"
          >
            <History className="h-4 w-4" />
            Feedback History
          </Button>
          <Button
            onClick={handleFeedbackClick}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-lg whitespace-nowrap"
            size="sm"
          >
            <Send className="h-4 w-4" />
            Submit Feedback
          </Button>
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative h-14 w-14 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-teal-500/30"
        aria-label="Feedback options"
      >
        {/* Icon with rotation animation */}
        <div className={`transition-transform duration-300 ${isExpanded ? "rotate-45" : "rotate-0"}`}>
          {isExpanded ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </div>

        {/* Pulse animation for attention */}
        {/* <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 animate-ping opacity-20"></div> */}

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </button>
    </div>
  )
}
