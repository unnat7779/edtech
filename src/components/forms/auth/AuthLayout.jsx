"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card"

export default function AuthLayout({ title, children, showAdminLogin = false, onAdminLoginClick }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-surface-tertiary to-bg-secondary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card variant="glass" className="shadow-2xl border-slate-700/50 backdrop-blur-md">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
              <span className="text-2xl font-bold text-white">E</span>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {children}

            {showAdminLogin && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border border-yellow-800/50 rounded-lg">
                <p className="text-sm text-yellow-400 mb-2 font-medium">Quick Admin Login (for testing):</p>
                <div className="text-xs text-yellow-300/80 mb-3 space-y-1">
                  <p>Email: admin@edtech.com</p>
                  <p>Password: admin123</p>
                </div>
                <button
                  type="button"
                  onClick={onAdminLoginClick}
                  className="w-full px-3 py-2 text-sm border border-yellow-700/50 rounded-lg hover:bg-yellow-800/30 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200 text-yellow-400 font-medium"
                >
                  Fill Admin Credentials
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
