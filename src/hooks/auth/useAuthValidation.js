"use client"

import { useState, useCallback } from "react"

export function useAuthValidation() {
  const [errors, setErrors] = useState({})

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  const validatePassword = useCallback((password) => {
    return password && password.length >= 6
  }, [])

  const validateName = useCallback((name) => {
    return name && name.trim().length >= 2
  }, [])

  const validateWhatsappNo = useCallback((whatsappNo) => {
    const phoneRegex = /^[6-9]\d{9}$/
    return phoneRegex.test(whatsappNo.replace(/\D/g, ""))
  }, [])

  const validateLoginForm = useCallback(
    (formData) => {
      const newErrors = {}

      if (!formData.email) {
        newErrors.email = "Email is required"
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email"
      }

      if (!formData.password) {
        newErrors.password = "Password is required"
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [validateEmail],
  )

  const validateRegisterForm = useCallback(
    (formData) => {
      const newErrors = {}

      if (!validateName(formData.name)) {
        newErrors.name = "Name must be at least 2 characters"
      }

      if (!formData.email) {
        newErrors.email = "Email is required"
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email"
      }

      if (!validatePassword(formData.password)) {
        newErrors.password = "Password must be at least 6 characters"
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }

      if (!validateWhatsappNo(formData.whatsappNo)) {
        newErrors.whatsappNo = "Please enter a valid WhatsApp number"
      }

      if (!formData.class) {
        newErrors.class = "Class is required"
      }

      if (formData.enrolledInCoaching && !formData.coachingName.trim()) {
        newErrors.coachingName = "Coaching name is required"
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [validateEmail, validatePassword, validateName, validateWhatsappNo],
  )

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((fieldName) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  return {
    errors,
    validateLoginForm,
    validateRegisterForm,
    clearErrors,
    clearFieldError,
    validateEmail,
    validatePassword,
    validateName,
    validateWhatsappNo,
  }
}
