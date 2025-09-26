"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? "text-primary-600 border-primary-600" : "text-gray-600 hover:text-primary-600"
  }

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-600">
              NexTrade-Platform
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === "/login" ? "bg-primary-600 text-white" : "text-gray-600 hover:text-primary-600"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === "/register"
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:text-primary-600"
                }`}
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            NexTrade-Platform
          </Link>

          <div className="flex space-x-8">
            <Link to="/" className={`border-b-2 border-transparent pb-1 transition-colors ${isActive("/")}`}>
              Dashboard
            </Link>
            <Link
              to="/products"
              className={`border-b-2 border-transparent pb-1 transition-colors ${isActive("/products")}`}
            >
              Products
            </Link>
            <Link
              to="/portfolio"
              className={`border-b-2 border-transparent pb-1 transition-colors ${isActive("/portfolio")}`}
            >
              Portfolio
            </Link>
            <Link
              to="/transactions"
              className={`border-b-2 border-transparent pb-1 transition-colors ${isActive("/transactions")}`}
            >
              Transactions
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-600">Balance: </span>
              <span className="font-semibold text-success-600">
                ₹{user?.walletBalance?.toLocaleString("en-IN") || "0"}
              </span>
            </div>
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <div className="px-4 py-2 text-sm text-gray-600 border-b">
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                    <div className="text-xs text-gray-500">
                      KYC:{" "}
                      <span
                        className={`font-medium ${
                          user?.kycStatus === "verified"
                            ? "text-success-600"
                            : user?.kycStatus === "pending"
                              ? "text-yellow-600"
                              : "text-danger-600"
                        }`}
                      >
                        {user?.kycStatus?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
