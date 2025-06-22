"use client"

import { BookOpen, Filter, Calendar } from "lucide-react"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"

export default function EmptyState({ hasFilters, onClearFilters, onBookSession }) {
  if (hasFilters) {
    return (
      <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50">
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No Sessions Match Your Filters</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Try adjusting your filters or search terms to find the sessions you're looking for.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onClearFilters} className="text-slate-300 border-slate-600">
              Clear Filters
            </Button>
            <Button variant="primary" onClick={onBookSession} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Book New Session
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/60 backdrop-blur-xl border-slate-700/50">
      <div className="p-12 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
          <BookOpen className="w-12 h-12 text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No Sessions Yet</h3>
        <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
          You haven't submitted any doubt sessions yet. Book your first session to get personalized help from our expert
          mentors.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            onClick={onBookSession}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg px-8 py-3"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book Your First Session
          </Button>
        </div>
      </div>
    </Card>
  )
}
