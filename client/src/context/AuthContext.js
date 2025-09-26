"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../services/api"
import toast from "react-hot-toast"

const AuthContext = createContext()

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return {
        ...state,
        loading: true,
        error: null,
      }
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      localStorage.setItem("token", action.payload.token)
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      }
    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
      localStorage.removeItem("token")
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      }
    case "LOGOUT":
      localStorage.removeItem("token")
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      verifyToken()
    }
  }, [])

  // Verify token validity
  const verifyToken = async () => {
    try {
      const response = await authAPI.verifyToken()
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          token: localStorage.getItem("token"),
          user: response.data.user,
        },
      })
    } catch (error) {
      dispatch({ type: "LOGOUT" })
    }
  }

  // Login function
  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" })
    try {
      const response = await authAPI.login(email, password)
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: response.data,
      })
      toast.success("Login successful!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      dispatch({
        type: "LOGIN_FAILURE",
        payload: message,
      })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Register function
  const register = async (userData) => {
    dispatch({ type: "REGISTER_START" })
    try {
      const response = await authAPI.register(userData)
      dispatch({
        type: "REGISTER_SUCCESS",
        payload: response.data,
      })
      toast.success("Registration successful!")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      dispatch({
        type: "REGISTER_FAILURE",
        payload: message,
      })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Logout function
  const logout = () => {
    dispatch({ type: "LOGOUT" })
    toast.success("Logged out successfully")
  }

  // Update user data
  const updateUser = (userData) => {
    dispatch({
      type: "UPDATE_USER",
      payload: userData,
    })
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
