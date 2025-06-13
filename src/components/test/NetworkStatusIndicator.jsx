"use client"

import { useState, useEffect } from "react"

export default function NetworkStatusIndicator({ syncQueue = {}, networkStatus = true }) {
  const [showDetails, setShowDetails] = useState(false)
  const [visible, setVisible] = useState(true)
  const queueCount = Object.keys(syncQueue).length

  // Auto-hide after 5 seconds when online and everything is synced
  useEffect(() => {
    if (networkStatus && queueCount === 0 && visible) {
      const timer = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [networkStatus, queueCount, visible])

  if (!visible || (networkStatus && queueCount === 0 && !showDetails)) {
    return null // Hide when everything is synced and online, or when dismissed
  }

  return (
    <div className="fixed top-16 right-4 z-50">
      <div
        className={`rounded-lg shadow-lg p-3 cursor-pointer transition-all duration-300 relative ${
          networkStatus
            ? queueCount > 0
              ? "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800"
              : "bg-green-100 border-l-4 border-green-500 text-green-800"
            : "bg-red-100 border-l-4 border-red-500 text-red-800"
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Animated Dismiss (cross) button */}
        <button
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/70 hover:bg-red-500/90 group transition-all duration-200 shadow-md hover:scale-110 active:scale-95"
          onClick={e => {
            e.stopPropagation()
            setVisible(false)
          }}
          aria-label="Dismiss"
        >
          <span
            className="block text-gray-500 group-hover:text-white text-lg font-bold transition-all duration-200 rotate-0 group-hover:rotate-90"
            style={{ lineHeight: 1 }}
          >
            &times;
          </span>
        </button>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${networkStatus ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm font-medium">
            {networkStatus ? (queueCount > 0 ? "Syncing..." : "Online") : "Offline"}
          </span>
          {queueCount > 0 && <span className="text-xs bg-white px-2 py-1 rounded-full">{queueCount}</span>}
        </div>

        {showDetails && (
          <div className="mt-2 text-xs">
            {networkStatus ? (
              queueCount > 0 ? (
                <div>
                  <p>Syncing {queueCount} unsaved answers...</p>
                  <p className="text-gray-600">Your answers are saved locally</p>
                </div>
              ) : (
                <p>All answers synced successfully</p>
              )
            ) : (
              <div>
                <p>Working offline</p>
                <p className="text-gray-600">
                  {queueCount > 0 ? `${queueCount} answers saved locally` : "Answers saved locally"}
                </p>
                <p className="text-gray-600">Will sync when connection returns</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
