"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { productsAPI, portfolioAPI, transactionsAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState("30")
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [buyUnits, setBuyUnits] = useState("")
  const [buyLoading, setBuyLoading] = useState(false)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [watchlistLoading, setWatchlistLoading] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await productsAPI.getById(id)
      setProduct(response.data.data)
      setIsInWatchlist(response.data.data.isInWatchlist)
    } catch (error) {
      toast.error("Failed to fetch product details")
      navigate("/products")
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

  const formatChartData = (priceHistory) => {
    return priceHistory.map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      price: entry.price,
    }))
  }

  const handleBuy = async () => {
    if (!buyUnits || Number.parseFloat(buyUnits) <= 0) {
      toast.error("Please enter a valid number of units")
      return
    }

    const units = Number.parseFloat(buyUnits)
    const totalCost = units * product.pricePerUnit

    if (totalCost > user.walletBalance) {
      toast.error("Insufficient wallet balance")
      return
    }

    setBuyLoading(true)
    try {
      const response = await transactionsAPI.buy({
        productId: product._id,
        units: units,
      })

      // Update user balance in context
      updateUser({ walletBalance: response.data.newWalletBalance })

      toast.success(`Successfully purchased ${units} units of ${product.name}`)
      setBuyModalOpen(false)
      setBuyUnits("")
    } catch (error) {
      const message = error.response?.data?.message || "Failed to process purchase"
      toast.error(message)
    } finally {
      setBuyLoading(false)
    }
  }

  const toggleWatchlist = async () => {
    setWatchlistLoading(true)
    try {
      if (isInWatchlist) {
        await portfolioAPI.removeFromWatchlist(product._id)
        setIsInWatchlist(false)
        toast.success("Removed from watchlist")
      } else {
        await portfolioAPI.addToWatchlist(product._id)
        setIsInWatchlist(true)
        toast.success("Added to watchlist")
      }
    } catch (error) {
      toast.error("Failed to update watchlist")
    } finally {
      setWatchlistLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Product not found</div>
      </div>
    )
  }

  const chartData = formatChartData(product.priceHistory || [])
  const totalCost = buyUnits ? Number.parseFloat(buyUnits) * product.pricePerUnit : 0

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/products")}
        className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
      >
        ← Back to Products
      </button>

      {/* Product Header */}
      <div className="card">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.category === "stock" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {product.category === "stock" ? "Stock" : "Mutual Fund"}
                </span>
              </div>
              <p className="text-lg text-gray-600 font-mono mb-4">{product.symbol}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Current Price</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(product.pricePerUnit)}</p>
                  <p className="text-xs text-gray-500">{product.metric.replace("_", " ")}</p>
                </div>

                {product.sector && (
                  <div>
                    <p className="text-sm text-gray-600">Sector</p>
                    <p className="text-lg font-semibold text-gray-900">{product.sector}</p>
                  </div>
                )}

                {product.marketCap > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Market Cap</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{(product.marketCap / 1000000000000).toFixed(2)}T
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Your Balance</p>
                  <p className="text-lg font-semibold text-success-600">{formatPrice(user?.walletBalance || 0)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 ml-6">
              <button
                onClick={() => setBuyModalOpen(true)}
                className="btn-primary px-6 py-3 text-lg"
                disabled={!user || user.walletBalance < product.pricePerUnit}
              >
                Buy Now
              </button>
              <button
                onClick={toggleWatchlist}
                disabled={watchlistLoading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isInWatchlist
                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {watchlistLoading ? "..." : isInWatchlist ? "★ Watching" : "☆ Watch"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">About</h2>
          </div>
          <div className="card-body">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        </div>
      )}

      {/* Price Chart */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Price Chart</h2>
            <div className="flex space-x-2">
              {["7", "30", "90"].map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    chartPeriod === period ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {period}D
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={["dataMin - 10", "dataMax + 10"]} tickFormatter={(value) => `₹${value.toFixed(0)}`} />
                <Tooltip
                  formatter={(value) => [formatPrice(value), "Price"]}
                  labelStyle={{ color: "#374151" }}
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#2563eb" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {buyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Buy {product.name}</h3>
              <button onClick={() => setBuyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of {product.metric === "per_share" ? "Shares" : "Units"}
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="input-field"
                  placeholder="Enter quantity"
                  value={buyUnits}
                  onChange={(e) => setBuyUnits(e.target.value)}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Price per {product.metric.replace("_", " ")}</span>
                  <span>{formatPrice(product.pricePerUnit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span>{buyUnits || 0}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total Cost</span>
                  <span>{formatPrice(totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available Balance</span>
                  <span className="text-success-600">{formatPrice(user?.walletBalance || 0)}</span>
                </div>
              </div>

              {totalCost > (user?.walletBalance || 0) && (
                <div className="text-red-600 text-sm">Insufficient balance for this purchase</div>
              )}

              <div className="flex space-x-3">
                <button onClick={() => setBuyModalOpen(false)} className="flex-1 btn-secondary" disabled={buyLoading}>
                  Cancel
                </button>
                <button
                  onClick={handleBuy}
                  disabled={buyLoading || totalCost > (user?.walletBalance || 0) || !buyUnits}
                  className="flex-1 btn-success"
                >
                  {buyLoading ? "Processing..." : "Confirm Purchase"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
