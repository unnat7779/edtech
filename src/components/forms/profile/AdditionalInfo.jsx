"use client"

import Input from "@/components/ui/Input"

export default function AdditionalInfo({ formData, onChange, errors }) {
  return (
    <div className="border-t border-gray-200 pt-4">
      <h3 className="text-lg font-medium mb-4">Additional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          name="profile.dateOfBirth"
          type="date"
          value={formData.profile.dateOfBirth}
          onChange={onChange}
          placeholder="Select your date of birth"
        />

        <Input
          label="Address"
          name="profile.address"
          value={formData.profile.address}
          onChange={onChange}
          placeholder="Enter your address"
        />

        <Input
          label="City"
          name="profile.city"
          value={formData.profile.city}
          onChange={onChange}
          placeholder="Enter your city"
        />

        <Input
          label="State"
          name="profile.state"
          value={formData.profile.state}
          onChange={onChange}
          placeholder="Enter your state"
        />

        <Input
          label="Pincode"
          name="profile.pincode"
          value={formData.profile.pincode}
          onChange={onChange}
          placeholder="Enter your pincode"
        />
      </div>
    </div>
  )
}
