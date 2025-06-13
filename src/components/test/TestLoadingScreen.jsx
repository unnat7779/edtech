"use client"

export default function TestLoadingScreen({ isClient }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-slate-700 border-t-teal-500 rounded-full animate-spin mx-auto mb-6"></div>
          <div
            className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-500 rounded-full animate-spin mx-auto"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          ></div>
        </div>
        <h2 className="text-xl font-semibold text-slate-200 mb-2">
          {!isClient ? "Initializing Test Portal..." : "Loading Your Test..."}
        </h2>
        <p className="text-slate-400">Please wait while we prepare everything for you</p>
      </div>
    </div>
  )
}
