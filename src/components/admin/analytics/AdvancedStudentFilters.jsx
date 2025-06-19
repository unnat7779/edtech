"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import {
  Users,
  UserCheck,
  UserX,
  Crown,
  Star,
  MessageCircle,
  Video,
  Heart,
  HeartOff,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import Button from "@/components/ui/Button"

const AdvancedStudentFilters = ({ onFiltersChange, currentFilters = {}, studentCounts = {} }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    activity: currentFilters.activity || "all",
    subscription: currentFilters.subscription || "all",
    subscriptionPlan: currentFilters.subscriptionPlan || "all",
    interest: currentFilters.interest || "all",
    ...currentFilters,
  })
  const [expandedSections, setExpandedSections] = useState({
    activity: false,
    subscription: false,
    interest: false,
  })

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter definitions with icons and descriptions
  const filterCategories = {
    activity: {
      title: "User Activity",
      icon: TrendingUp,
      description: "Filter by user engagement and activity",
      options: [
        {
          value: "all",
          label: "All Users",
          icon: Users,
          description: "Show all registered users",
          count: studentCounts.total || 0,
        },
        {
          value: "active",
          label: "Active Users",
          icon: UserCheck,
          description: "Users active in the last 30 days",
          count: studentCounts.active || 0,
          color: "text-green-400",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
        },
        {
          value: "inactive",
          label: "Inactive Users",
          icon: UserX,
          description: "Users inactive for more than 30 days",
          count: studentCounts.inactive || 0,
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
        },
      ],
    },
    subscription: {
      title: "Subscription Status",
      icon: Crown,
      description: "Filter by premium subscription status",
      options: [
        {
          value: "all",
          label: "All Subscription Types",
          icon: Users,
          description: "Show users with any subscription status",
          count: studentCounts.total || 0,
        },
        {
          value: "premium",
          label: "Premium Users",
          icon: Crown,
          description: "Users with active premium subscriptions",
          count: studentCounts.premium || 0,
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          hasSubFilters: true,
        },
        {
          value: "free",
          label: "Free Users",
          icon: Users,
          description: "Users without premium subscriptions",
          count: studentCounts.free || 0,
          color: "text-slate-400",
          bgColor: "bg-slate-500/10",
          borderColor: "border-slate-500/30",
        },
      ],
    },
    subscriptionPlan: {
      title: "Premium Plan Types",
      icon: Sparkles,
      description: "Filter by specific premium plan",
      parentFilter: "subscription",
      parentValue: "premium",
      options: [
        {
          value: "all",
          label: "All Premium Plans",
          icon: Crown,
          description: "Show all premium subscribers",
          count: studentCounts.premium || 0,
        },
        {
          value: "mentorship-silver",
          label: "1:1 Mentorship - Silver",
          icon: Crown,
          description: "Silver tier mentorship subscribers",
          count: studentCounts.mentorshipSilver || 0,
          color: "text-slate-300",
          bgColor: "bg-slate-500/10",
          borderColor: "border-slate-500/30",
        },
        {
          value: "mentorship-gold",
          label: "1:1 Mentorship - Gold",
          icon: Star,
          description: "Gold tier mentorship subscribers",
          count: studentCounts.mentorshipGold || 0,
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
        },
        {
          value: "chat-doubt",
          label: "PCM Chat Doubt Support",
          icon: MessageCircle,
          description: "Chat-based doubt solving subscribers",
          count: studentCounts.chatDoubt || 0,
          color: "text-green-400",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
        },
        {
          value: "live-doubt",
          label: "PCM Live 1:1 Doubt Support",
          icon: Video,
          description: "Live doubt solving subscribers",
          count: studentCounts.liveDoubt || 0,
          color: "text-blue-400",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
        },
      ],
    },
    interest: {
      title: "Subscription Interest",
      icon: Heart,
      description: "Filter by interest in premium subscriptions",
      options: [
        {
          value: "all",
          label: "All Interest Levels",
          icon: Users,
          description: "Show users regardless of interest status",
          count: studentCounts.total || 0,
        },
        {
          value: "interested",
          label: "Interested Users",
          icon: Heart,
          description: "Users interested in premium subscriptions",
          count: studentCounts.interested || 0,
          color: "text-pink-400",
          bgColor: "bg-pink-500/10",
          borderColor: "border-pink-500/30",
        },
        {
          value: "not-interested",
          label: "Not Interested Users",
          icon: HeartOff,
          description: "Users not interested in premium subscriptions",
          count: studentCounts.notInterested || 0,
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/30",
        },
      ],
    },
  }

  // Handle filter changes
  const handleFilterChange = (category, value) => {
    const newFilters = { ...selectedFilters, [category]: value }

    // Reset dependent filters
    if (category === "subscription" && value !== "premium") {
      newFilters.subscriptionPlan = "all"
    }

    setSelectedFilters(newFilters)
    onFiltersChange(newFilters)
  }

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).filter((value) => value !== "all").length
  }

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters = {
      activity: "all",
      subscription: "all",
      subscriptionPlan: "all",
      interest: "all",
    }
    setSelectedFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  // Filter option component
  const FilterOption = ({ option, category, isSelected, isDisabled = false }) => {
    const IconComponent = option.icon
    const isSubFilter = filterCategories[category].parentFilter

    return (
      <button
        onClick={() => !isDisabled && handleFilterChange(category, option.value)}
        disabled={isDisabled}
        className={`
          w-full text-left p-4 rounded-lg border transition-all duration-200 group
          ${
            isSelected
              ? `${option.borderColor || "border-teal-500/50"} ${option.bgColor || "bg-teal-500/10"} shadow-lg`
              : "border-slate-700/50 hover:border-slate-600 hover:bg-slate-700/30"
          }
          ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isSubFilter ? "ml-4 border-l-4" : ""}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`
                p-2 rounded-lg transition-colors
                ${
                  isSelected
                    ? `${option.bgColor || "bg-teal-500/20"} ${option.color || "text-teal-400"}`
                    : "bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50"
                }
              `}
            >
              <IconComponent className="h-4 w-4" />
            </div>
            <div>
              <div
                className={`
                  font-medium transition-colors
                  ${isSelected ? option.color || "text-teal-300" : "text-slate-300 group-hover:text-slate-200"}
                `}
              >
                {option.label}
              </div>
              <div className="text-xs text-slate-500 mt-1">{option.description}</div>
            </div>
          </div>
          <div
            className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${
                isSelected
                  ? `${option.bgColor || "bg-teal-500/20"} ${option.color || "text-teal-400"}`
                  : "bg-slate-700/50 text-slate-400"
              }
            `}
          >
            {option.count?.toLocaleString() || 0}
          </div>
        </div>
      </button>
    )
  }

  // Filter section component
  const FilterSection = ({ categoryKey, category }) => {
    const IconComponent = category.icon
    const isExpanded = expandedSections[categoryKey]
    const isParentFilter = category.parentFilter
    const shouldShow = !isParentFilter || selectedFilters[category.parentFilter] === category.parentValue

    if (!shouldShow) return null

    return (
      <div className="space-y-3">
        <button
          onClick={() => toggleSection(categoryKey)}
          className="w-full flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <IconComponent className="h-5 w-5 text-slate-400" />
            <div>
              <div className="text-slate-200 font-medium text-left">{category.title}</div>
              <div className="text-xs text-slate-500 text-left">{category.description}</div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            {category.options.map((option) => (
              <FilterOption
                key={option.value}
                option={option}
                category={categoryKey}
                isSelected={selectedFilters[categoryKey] === option.value}
                isDisabled={option.value !== "all" && option.count === 0}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Modal content component
  const ModalContent = () => (
    <div className="fixed inset-0 z-[999999] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

      {/* Filter Modal */}
      <div className="relative w-full max-w-md bg-slate-800/98 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl animate-in slide-in-from-top-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Filter Students</h3>
            <p className="text-xs text-slate-400">Refine your student analytics view</p>
          </div>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Button
                onClick={clearAllFilters}
                size="sm"
                className="text-xs bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
              >
                Clear All
              </Button>
            )}
            <Button
              onClick={() => setIsOpen(false)}
              size="sm"
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {Object.entries(filterCategories).map(([categoryKey, category]) => (
            <FilterSection key={categoryKey} categoryKey={categoryKey} category={category} />
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {getActiveFilterCount() > 0
                ? `${getActiveFilterCount()} filter${getActiveFilterCount() > 1 ? "s" : ""} applied`
                : "No filters applied"}
            </span>
            <span>Total: {studentCounts.total?.toLocaleString() || 0} students</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
          ${
            isOpen
              ? "bg-teal-600 border-teal-500 text-white shadow-lg"
              : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
          }
        `}
      >
        <Filter className="h-4 w-4" />
        <span>Advanced Filters</span>
        {getActiveFilterCount() > 0 && (
          <div className="bg-teal-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
            {getActiveFilterCount()}
          </div>
        )}
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Render Modal using Portal */}
      {isOpen && mounted && typeof window !== "undefined" && createPortal(<ModalContent />, document.body)}
    </div>
  )
}

export default AdvancedStudentFilters
