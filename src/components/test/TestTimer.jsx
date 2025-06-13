import { Clock, AlertTriangle } from "lucide-react"

export default function TestTimer({ timeLeft }) {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const isLowTime = timeLeft < 300 // Less than 5 minutes
  const isCriticalTime = timeLeft < 60 // Less than 1 minute

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 ${
      isCriticalTime ? "animate-pulse border-red-400/50 shadow-lg shadow-red-400/20" : 
      isLowTime ? "border-yellow-400/50 shadow-lg shadow-yellow-400/20" : 
      "border-green-400/50 shadow-lg shadow-green-400/20"
    } transition-all duration-300`}>
      <div className="flex items-center gap-3">
        {/* Single icon - only one will render */}
        <div className="relative">
          {isCriticalTime ? (
            <AlertTriangle className={`h-5 w-5 text-red-400 transition-all duration-300 ${
              isCriticalTime ? "animate-bounce" : ""
            }`} />
          ) : (
            <Clock className={`h-5 w-5 transition-all duration-300 ${
              isLowTime ? "text-yellow-400" : "text-green-400"
            }`} />
          )}
        </div>
        
        <div className="text-center">
          <div className="text-xs text-slate-400 mb-1">Time Remaining</div>
          <div
            className={`text-2xl font-bold font-mono transition-all duration-300 ${
              isCriticalTime ? "text-red-400" : isLowTime ? "text-yellow-400" : "text-green-400"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>
    </div>
  )
}
