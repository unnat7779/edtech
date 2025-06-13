import { forwardRef } from "react"

const Button = forwardRef(({ className = "", variant = "primary", size = "md", children, disabled, ...props }, ref) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105"

  const variants = {
    primary:
      "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl hover:shadow-teal-900/30 rounded-lg focus-visible:ring-teal-500",
    secondary:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:shadow-blue-900/30 rounded-lg focus-visible:ring-blue-500",
    accent:
      "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 shadow-lg hover:shadow-xl hover:shadow-yellow-900/30 rounded-lg focus-visible:ring-yellow-500",
    outline:
      "border-2 border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-slate-900 rounded-lg focus-visible:ring-teal-500",
    ghost: "text-slate-300 hover:bg-slate-800 rounded-lg focus-visible:ring-slate-500",
    destructive:
      "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl hover:shadow-red-900/30 rounded-lg focus-visible:ring-red-500",
  }

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 py-3",
    lg: "h-12 px-8 text-lg",
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button
