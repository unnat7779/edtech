"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { User, Mail, Lock, Phone, GraduationCap, Building } from "lucide-react"

export default function RegisterFields({ onSubmit, loading, errors }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    whatsappNo: "",
    class: "",
    enrolledInCoaching: false,
    coachingName: "",
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <User className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter your full name"
            icon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
            icon={<Mail className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter password (min 6 characters)"
            icon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            icon={<Lock className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Contact & Academic Information */}
      <div className="space-y-4 pt-4 border-t border-slate-700">
        <div className="flex items-center space-x-2 mb-4">
          <GraduationCap className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Academic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="WhatsApp Number"
            name="whatsappNo"
            value={formData.whatsappNo}
            onChange={handleChange}
            error={errors.whatsappNo}
            placeholder="Enter your WhatsApp number"
            icon={<Phone className="w-4 h-4" />}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Class</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Class</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
                <option value="Dropper">Dropper</option>
              </select>
            </div>
            {errors.class && <p className="text-sm text-red-400">{errors.class}</p>}
          </div>
        </div>
      </div>

      {/* Coaching Information */}
      <div className="space-y-4 pt-4 border-t border-slate-700">
        <div className="flex items-center space-x-2 mb-4">
          <Building className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Coaching Information</h3>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="enrolledInCoaching"
            checked={formData.enrolledInCoaching}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label className="text-slate-300">I am enrolled in a coaching institute</label>
        </div>

        {formData.enrolledInCoaching && (
          <Input
            label="Coaching Name"
            name="coachingName"
            value={formData.coachingName}
            onChange={handleChange}
            error={errors.coachingName}
            placeholder="Enter coaching name"
            icon={<Building className="w-4 h-4" />}
          />
        )}
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{errors.submit}</p>
        </div>
      )}

      <Button type="submit" className="w-full py-3 text-lg" disabled={loading}>
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Creating Account...</span>
          </div>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}
