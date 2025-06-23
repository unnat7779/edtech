const Card = ({ children, className = "", variant = "default" }) => {
  const variants = {
    default:
      "bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300",
    primary:
      "bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-lg hover:shadow-xl hover:shadow-teal-900/10 transition-all duration-300 hover:border-teal-800",
    secondary:
      "bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-lg hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:border-blue-800",
    accent:
      "bg-gradient-to-br from-slate-800 to-slate-900 border border-yellow-900/50 shadow-lg hover:shadow-xl hover:shadow-yellow-900/10 transition-all duration-300",
    glass: "glass-card",
  }

  return <div className={`${variants[variant]} rounded-xl ${className}`}>{children}</div>
}

const CardHeader = ({ children, className = "" }) => {
  return <div className={`p-6 pb-4 ${className}`}>{children}</div>
}

const CardContent = ({ children, className = "" }) => {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>
}

const CardTitle = ({ children, className = "", gradient = false }) => {
  const gradientClass = gradient
    ? "bg-gradient-to-r from-teal-400 to-teal-500 bg-clip-text text-transparent"
    : "text-slate-100"
  return <h3 className={`text-lg font-semibold ${gradientClass} ${className}`}>{children}</h3>
}

export { Card, CardHeader, CardContent, CardTitle }

export default Card
