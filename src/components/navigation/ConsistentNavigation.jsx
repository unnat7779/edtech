"use client"
import { useState } from "react"
import { Menu, X, LayoutDashboard, Shield } from "lucide-react"
import Button from "../ui/Button"

export default function ConsistentNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-12">
          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo and brand */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JE</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-lg">JEEElevate</h1>
                <p className="text-slate-400 text-xs">Let's Ace JEE Together</p>
              </div>
            </div>

            {/* Desktop navigation links */}
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="/dashboard"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800"
              >
                Dashboard
              </a>
              <a
                href="/tests"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800"
              >
                Tests
              </a>
              <a
                href="/analytics"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800"
              >
                Analytics
              </a>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center space-x-2 bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
            >
              <Shield size={16} />
              <span>Admin</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center space-x-2 bg-slate-800 text-teal-400 border-slate-700 hover:bg-slate-700 hover:text-teal-300"
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Button>

            {/* User avatar */}
            <div className="relative">
              <button className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-medium text-sm hover:bg-teal-600 transition-colors">
                A
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-800">
            <div className="flex flex-col space-y-2 pt-4">
              <a
                href="/dashboard"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800 flex items-center space-x-2"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </a>
              <a
                href="/tests"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800"
              >
                Tests
              </a>
              <a
                href="/analytics"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800"
              >
                Analytics
              </a>
              <div className="pt-2 border-t border-slate-800 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-blue-600 text-white border-blue-600 hover:bg-blue-700 mb-2"
                >
                  <Shield size={16} className="mr-2" />
                  Admin
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
