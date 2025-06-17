"use client"

import { CheckCircle, X } from "lucide-react"

export default function SuccessNotification({ notification, onClose }) {
  if (!notification) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg shadow-xl border border-green-400/20 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Reply Sent Successfully!</h4>
            <p className="text-xs text-green-100 mb-2">
              Your response to <span className="font-medium">{notification.studentName}</span> has been sent.
            </p>
            <p className="text-xs text-green-200 truncate">Re: {notification.feedbackTitle}</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 text-white/80 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
