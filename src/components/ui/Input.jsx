"use client"

const Input = ({ type = "text", placeholder, value, onChange, className = "", label, name, error, icon, ...props }) => {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 ${icon ? "pl-10" : ""} rounded-lg border border-slate-600 bg-slate-700/50 backdrop-blur-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:bg-slate-700/70 ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export default Input
