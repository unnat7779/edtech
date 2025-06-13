"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function NavigationBlockedNotification({ message, isVisible, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!visible) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in-right">
      <div className="bg-red-900/90 backdrop-blur-md border border-red-700/50 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-white font-medium">{message || "Navigation blocked"}</p>
            <p className="text-red-200 text-sm mt-1">You cannot return to the test after submission.</p>
          </div>
          <button
            onClick={() => {
              setVisible(false)
              if (onClose) onClose()
            }}
            className="text-red-300 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
