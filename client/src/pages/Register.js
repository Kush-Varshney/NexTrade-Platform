"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    panNumber: "",
    kycDocument: null,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const { register, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (name === "kycDocument") {
      setFormData({
        ...formData,
        [name]: files[0],
      })
    } else if (name === "panNumber") {
      // Convert PAN number to uppercase
      setFormData({
        ...formData,
        [name]: value.toUpperCase(),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.panNumber.trim()) {
      newErrors.panNumber = "PAN number is required"
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)"
    }

    if (!formData.kycDocument) {
      newErrors.kycDocument = "KYC document is required"
    } else {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
      if (!allowedTypes.includes(formData.kycDocument.type)) {
        newErrors.kycDocument = "Only JPEG, PNG, and PDF files are allowed"
      } else if (formData.kycDocument.size > 5 * 1024 * 1024) {
        newErrors.kycDocument = "File size must be less than 5MB"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const result = await register(formData)
    if (result.success) {
      navigate("/", { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              sign in to existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`mt-1 input-field ${errors.name ? "border-red-500" : ""}`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`mt-1 input-field ${errors.email ? "border-red-500" : ""}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={`input-field pr-10 ${errors.password ? "border-red-500" : ""}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="text-gray-400 text-sm">{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`mt-1 input-field ${errors.confirmPassword ? "border-red-500" : ""}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* PAN Number */}
            <div>
              <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700">
                PAN Number
              </label>
              <input
                id="panNumber"
                name="panNumber"
                type="text"
                required
                className={`mt-1 input-field uppercase ${errors.panNumber ? "border-red-500" : ""}`}
                placeholder="ABCDE1234F"
                value={formData.panNumber}
                onChange={handleChange}
                maxLength={10}
              />
              {errors.panNumber && <p className="mt-1 text-sm text-red-600">{errors.panNumber}</p>}
              <p className="mt-1 text-xs text-gray-500">Format: 5 letters + 4 digits + 1 letter</p>
            </div>

            {/* KYC Document */}
            <div>
              <label htmlFor="kycDocument" className="block text-sm font-medium text-gray-700">
                KYC Document
              </label>
              <input
                id="kycDocument"
                name="kycDocument"
                type="file"
                required
                accept=".jpg,.jpeg,.png,.pdf"
                className={`mt-1 input-field ${errors.kycDocument ? "border-red-500" : ""}`}
                onChange={handleChange}
              />
              {errors.kycDocument && <p className="mt-1 text-sm text-red-600">{errors.kycDocument}</p>}
              <p className="mt-1 text-xs text-gray-500">Upload Aadhaar, Passport, or Driver's License (Max 5MB)</p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy. Your KYC information will be
            securely stored and used for verification purposes only.
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
