"use client"

import { useState, useEffect } from "react"

export default function StorageIndicator() {
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    percentage: 0,
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const updateStorageInfo = () => {
      try {
        // Calculate localStorage usage
        let totalSize = 0
        let testDataSize = 0

        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key)
            const size = new Blob([value]).size
            totalSize += size

            if (key.includes("answer_") || key.includes("progress_") || key.includes("test_")) {
              testDataSize += size
            }
          }
        }

        // Estimate available space (localStorage typically has 5-10MB limit)
        const estimatedLimit = 5 * 1024 * 1024 // 5MB
        const percentage = (totalSize / estimatedLimit) * 100

        setStorageInfo({
          used: totalSize,
          testData: testDataSize,
          available: estimatedLimit - totalSize,
          percentage: Math.min(percentage, 100),
        })
      } catch (error) {
        console.warn("Could not calculate storage usage:", error)
      }
    }

    updateStorageInfo()
    const interval = setInterval(updateStorageInfo, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  if (storageInfo.percentage < 50) {
    return null // Only show when storage usage is significant
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div
        className={`rounded-lg shadow-lg p-3 cursor-pointer transition-all duration-300 ${
          storageInfo.percentage > 80
            ? "bg-red-100 border-l-4 border-red-500 text-red-800"
            : storageInfo.percentage > 60
              ? "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800"
              : "bg-blue-100 border-l-4 border-blue-500 text-blue-800"
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-current" />
          <span className="text-sm font-medium">Storage: {storageInfo.percentage.toFixed(0)}%</span>
        </div>

        {showDetails && (
          <div className="mt-2 text-xs space-y-1">
            <div>Total used: {formatBytes(storageInfo.used)}</div>
            <div>Test data: {formatBytes(storageInfo.testData)}</div>
            <div>Available: {formatBytes(storageInfo.available)}</div>
            {storageInfo.percentage > 80 && <div className="text-red-600 font-medium">Storage almost full!</div>}
          </div>
        )}
      </div>
    </div>
  )
}
