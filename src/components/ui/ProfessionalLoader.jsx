export default function ProfessionalLoader({
  title = "Initializing Dashboard",
  subtitle = "Please wait while we prepare your experience",
  showSteps = true,
  currentStep = 0,
  steps = ["Authenticating credentials", "Loading user preferences", "Preparing dashboard", "Finalizing setup"],
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Geometric Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-500/10 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-purple-500/10 rotate-12 animate-pulse" />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full animate-bounce" />
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Logo/Brand Area */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-300 text-sm">{subtitle}</p>
        </div>

        {/* Advanced Loading Spinner */}
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto">
            {/* Outer Ring */}
            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
            {/* Animated Ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
            {/* Inner Pulse */}
            <div className="absolute inset-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
            {/* Center Dot */}
            <div className="absolute inset-1/2 w-2 h-2 -ml-1 -mt-1 bg-white rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Progress Steps */}
        {showSteps && (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                    index < currentStep
                      ? "bg-green-500 text-white"
                      : index === currentStep
                        ? "bg-blue-500 text-white animate-pulse"
                        : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-sm transition-colors duration-500 ${
                    index <= currentStep ? "text-white" : "text-slate-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-slate-400 text-xs mt-2">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-1 mt-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Branding */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-slate-500 text-xs">Powered by Advanced Analytics Platform</p>
      </div>
    </div>
  )
}
