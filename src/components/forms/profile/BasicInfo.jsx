"use client"

import Input from "@/components/ui/Input"

export default function BasicInfo({ formData, onChange, errors }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={onChange}
        error={errors.name}
        placeholder="Enter your full name"
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={onChange}
        disabled
        placeholder="Email cannot be changed"
      />

      <Input
        label="WhatsApp Number"
        name="whatsappNo"
        value={formData.whatsappNo}
        onChange={onChange}
        error={errors.whatsappNo}
        placeholder="Enter your WhatsApp number"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Class</label>
        <select
          name="class"
          value={formData.class}
          onChange={onChange}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Class</option>
          <option value="9">Class 9</option>
          <option value="10">Class 10</option>
          <option value="11">Class 11</option>
          <option value="12">Class 12</option>
          <option value="Dropper">Dropper</option>
        </select>
        {errors.class && <p className="text-sm text-red-600">{errors.class}</p>}
      </div>
    </div>
  )
}
