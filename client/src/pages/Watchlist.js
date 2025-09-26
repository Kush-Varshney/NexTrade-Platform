"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { watchlistAPI } from "../services/api"

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const response = await watchlistAPI.getAll()
      setWatchlist(response.data.data.watchlist || [])
    } catch (error) {
      setError("Failed to fetch watchlist")
      console.error("Error fetching watchlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = async (productId) => {
    try {
      await watchlistAPI.remove(productId)
      setWatchlist(watchlist.filter((item) => {
        const product = item.productId || item
        return product._id !== productId
      }))
    } catch (error) {
      setError("Failed to remove from watchlist")
      console.error("Error removing from watchlist:", error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price)
  }

  const getCategoryColor = (category) => {
    const colors = {
      Stock: "bg-blue-100 text-blue-800",
      "Mutual Fund": "bg-green-100 text-green-800",
      ETF: "bg-purple-100 text-purple-800",
      Bond: "bg-yellow-100 text-yellow-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
          <p className="text-gray-600 mt-1">Keep track of your favorite investments</p>
        </div>
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {watchlist.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">👁️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your watchlist is empty</h3>
            <p className="text-gray-600 mb-6">Start adding products to keep track of your favorite investments</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {watchlist.map((item) => {
            const product = item.productId || item
            return (
              <div key={product._id} className="card hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.category === "stock" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {product.category === "stock" ? "Stock" : "Mutual Fund"}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{product.symbol}</p>
                      <div className="flex items-center space-x-6">
                        <div>
                          <p className="text-sm text-gray-500">Current Price</p>
                          <p className="text-2xl font-bold text-gray-900">{formatPrice(product.pricePerUnit)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Metric</p>
                          <p className="text-lg font-medium text-gray-700">{product.metric}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-6">
                      <Link to={`/products/${product._id}`} className="btn-primary text-center">
                        View Details
                      </Link>
                      <button onClick={() => removeFromWatchlist(product._id)} className="btn-secondary">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Watchlist
