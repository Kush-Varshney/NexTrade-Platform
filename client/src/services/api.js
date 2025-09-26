import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Create separate instance for file uploads
const uploadApi = axios.create({
  baseURL: API_BASE_URL,
})

// Request interceptor to add auth token
const requestInterceptor = (config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

api.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error))
uploadApi.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error))

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (userData) => {
    const formData = new FormData()
    Object.keys(userData).forEach((key) => {
      formData.append(key, userData[key])
    })
    return uploadApi.post("/auth/register", formData)
  },
  verifyToken: () => api.post("/auth/verify-token"),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
}

// Products API
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
}

// Transactions API
export const transactionsAPI = {
  buy: (transactionData) => api.post("/transactions/buy", transactionData),
  sell: (transactionData) => api.post("/transactions/sell", transactionData),
  getAll: (params) => api.get("/transactions", { params }),
  getStats: () => api.get("/transactions/summary/stats"),
}

// Portfolio API
export const portfolioAPI = {
  getDashboard: () => api.get("/portfolio"),
  addToWatchlist: (productId) => api.post("/portfolio/watchlist", { productId }),
  removeFromWatchlist: (productId) => api.delete(`/portfolio/watchlist/${productId}`),
}

// Watchlist API
export const watchlistAPI = {
  getAll: () => api.get("/portfolio"),
  add: (productId) => api.post("/portfolio/watchlist", { productId }),
  remove: (productId) => api.delete(`/portfolio/watchlist/${productId}`),
}

export default api
