import { MessageSquare, Clock, Timer, CheckCircle, Bug, AlertCircle, TrendingUp } from "lucide-react"

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200">
    <div className="flex items-center justify-between mb-2">
      <Icon className={`h-5 w-5 ${color}`} />
      {trend && (
        <div className="flex items-center gap-1 text-xs text-green-400">
          <TrendingUp className="h-3 w-3" />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 font-medium">{title}</p>
    </div>
  </div>
)

export default function FeedbackStatistics({ statistics }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <StatCard title="Total Feedback" value={statistics.total || 0} icon={MessageSquare} color="text-slate-300" />
      <StatCard title="Open" value={statistics.open || 0} icon={Clock} color="text-yellow-400" />
      <StatCard title="In Progress" value={statistics.inProgress || 0} icon={Timer} color="text-blue-400" />
      <StatCard title="Resolved" value={statistics.resolved || 0} icon={CheckCircle} color="text-green-400" />
      <StatCard title="Bug Reports" value={statistics.bugs || 0} icon={Bug} color="text-red-400" />
      <StatCard title="Urgent" value={statistics.urgent || 0} icon={AlertCircle} color="text-orange-400" />
    </div>
  )
}
