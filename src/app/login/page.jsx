import LoginForm from "@/components/forms/LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Sign in to continue your learning journey and access your dashboard
          </p>
        </div>

        <LoginForm />

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
