"use client"

import { useState } from "react"

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    class: "",
    phone: "",
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateForm(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      // Form is valid, submit data
      try {
        // Simulate API call
        console.log("Form Data:", formData)
        alert("Registration Successful!")
      } catch (error) {
        console.error("Registration failed:", error)
        alert("Registration Failed!")
      }
    }
  }

  const validateForm = (data) => {
    const errors = {}

    if (!data.firstName) {
      errors.firstName = "First Name is required"
    }

    if (!data.lastName) {
      errors.lastName = "Last Name is required"
    }

    if (!data.email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid"
    }

    if (!data.password) {
      errors.password = "Password is required"
    } else if (data.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    if (!data.class) {
      errors.class = "Class is required"
    }

    if (!data.phone) {
      errors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(data.phone)) {
      errors.phone = "Phone number must be 10 digits"
    }

    return errors
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="firstName">First Name:</label>
        <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
        {errors.firstName && <p className="error">{errors.firstName}</p>}
      </div>

      <div>
        <label htmlFor="lastName">Last Name:</label>
        <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
        {errors.lastName && <p className="error">{errors.lastName}</p>}
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <p className="error">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
        {errors.password && <p className="error">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
      </div>

      <div>
        <label htmlFor="class">Class:</label>
        <select id="class" name="class" value={formData.class} onChange={handleChange}>
          <option value="">Select Class</option>
          <option value="11th">Class 11th</option>
          <option value="12th">Class 12th</option>
          <option value="Dropper">Dropper</option>
        </select>
        {errors.class && <p className="error">{errors.class}</p>}
      </div>

      <div>
        <label htmlFor="phone">Phone Number:</label>
        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
        {errors.phone && <p className="error">{errors.phone}</p>}
      </div>

      <button type="submit">Register</button>
    </form>
  )
}

export default RegisterForm
