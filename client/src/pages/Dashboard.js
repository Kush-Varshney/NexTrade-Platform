"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { portfolioAPI, transactionsAPI, watchlistAPI } from "../services/api"

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    totalInvested: 0,
    currentValue: 0,
    totalReturns: 0,
    returnsPercentage: 0,
    recentTransactions: [],
    topHoldings: [],
    watchlist: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [portfolioResponse, transactionsResponse, watchlistResponse] = await Promise.all([
        portfolioAPI.getDashboard(),
        transactionsAPI.getAll({ limit: 5 }),
        watchlistAPI.getAll(),
      ])

      const portfolio = portfolioResponse.data
      const transactions = transactionsResponse.data.transactions || []
      const watchlist = watchlistResponse.data.watchlist || []

      setDashboardData({
        totalInvested: portfolio.totalInvested || 0,
        currentValue: portfolio.currentValue || 0,
        totalReturns: portfolio.totalReturns || 0,
        returnsPercentage: portfolio.returnsPercentage || 0,
        recentTransactions: transactions,
        topHoldings: portfolio.holdings || [],
        watchlist: Array.isArray(watchlist) ? watchlist.slice(0, 3) : [], // Show only top 3 watchlist items
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const getReturnColor = (returns) => {
    if (returns > 0) return "text-success-600"
    if (returns < 0) return "text-danger-600"
    return "text-gray-600"
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-primary-100">Here's your portfolio overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold text-success-600">{formatPrice(user?.walletBalance || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <span className="text-success-600 text-xl">₹</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(dashboardData.totalInvested)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(dashboardData.currentValue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">💼</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Returns</p>
                <p className={`text-2xl font-bold ${getReturnColor(dashboardData.totalReturns)}`}>
                  {formatPrice(dashboardData.totalReturns)}
                </p>
                <p className={`text-sm ${getReturnColor(dashboardData.totalReturns)}`}>
                  ({dashboardData.returnsPercentage.toFixed(2)}%)
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link
              to="/products"
              className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">🛒</span>
              </div>
              <span className="text-sm font-medium text-primary-700">Browse Products</span>
            </Link>

            <Link
              to="/portfolio"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">💼</span>
              </div>
              <span className="text-sm font-medium text-green-700">View Portfolio</span>
            </Link>

            <Link
              to="/transactions"
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">📋</span>
              </div>
              <span className="text-sm font-medium text-blue-700">Transaction History</span>
            </Link>

            <Link
              to="/watchlist"
              className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">👁️</span>
              </div>
              <span className="text-sm font-medium text-orange-700">Watchlist</span>
            </Link>

            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">⚙️</span>
              </div>
              <span className="text-sm font-medium text-gray-600">Settings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <Link to="/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="card-body">
            {dashboardData.recentTransactions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No transactions yet</p>
                <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
                  Start investing →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">📈</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.product?.name}</p>
                        <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{transaction.units} units</p>
                      <p className="text-sm text-gray-600">{formatPrice(transaction.totalAmount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Watchlist Preview */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Watchlist</h2>
              <Link to="/watchlist" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="card-body">
            {dashboardData.watchlist.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Your watchlist is empty</p>
                <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
                  Add products →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.watchlist.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(product.pricePerUnit)}</p>
                      <Link to={`/products/${product._id}`} className="text-sm text-primary-600 hover:text-primary-700">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KYC Status */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Account Status</h2>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  user?.kycStatus === "verified"
                    ? "bg-success-500"
                    : user?.kycStatus === "pending"
                      ? "bg-yellow-500"
                      : "bg-danger-500"
                }`}
              ></div>
              <div>
                <p className="font-medium">KYC Verification</p>
                <p className="text-sm text-gray-600">
                  Status:{" "}
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
                </p>
              </div>
            </div>
            {user?.kycStatus === "pending" && (
              <div className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded">Under Review</div>
            )}
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Market Overview</h2>
        </div>
        <div className="card-body">
          <div className="text-center text-gray-500 py-8">
            <p>Market data will be available soon</p>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
              Browse available products →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
