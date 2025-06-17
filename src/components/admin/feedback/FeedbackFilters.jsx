"use client"

import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Filter, Search, RefreshCw, ChevronDown } from "lucide-react"

export default function FeedbackFilters({ filters, setFilters, showFilters, setShowFilters, onRefresh }) {
  return (
    <Card variant="secondary" className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Filters</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-slate-400 hover:text-slate-300"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        <div className={`space-y-4 transition-all duration-200 ${showFilters ? "block" : "hidden"}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="bug">Bug Reports</option>
              <option value="test-issue">Test Issues</option>
              <option value="query">Queries</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
